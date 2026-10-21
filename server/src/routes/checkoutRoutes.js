import { Router } from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import StoreSetting from "../models/StoreSetting.js";
import InventoryMovement from "../models/InventoryMovement.js";
import { calculateOrderPricing } from "../services/pricingService.js";
import {
  createRazorpayOrder as createRzpOrder,
  verifyRazorpaySignature as verifyRzpSig,
  fetchRazorpayPayment,
} from "../config/razorpay.js";
import { requireCustomerAuth } from "./userAuthRoutes.js";

function customerFromUser(user) {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  };
}

function assertOrderOwner(order, user) {
  if (!order.userId || order.userId.toString() !== user._id.toString()) {
    return false;
  }
  return true;
}

const router = Router();

// Helper to generate sequential-style readable Order ID: e.g. ORD-20261016-4821
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
}

// Helper to assign invoice number
async function assignInvoiceNumber() {
  let settings = await StoreSetting.findOne();
  if (!settings) {
    settings = await StoreSetting.create({});
  }
  const nextSeq = (settings.currentInvoiceSequence || 1000) + 1;
  settings.currentInvoiceSequence = nextSeq;
  await settings.save();
  const year = new Date().getFullYear();
  return `${settings.invoicePrefix || "INV"}-${year}-${nextSeq}`;
}

// Deduct variant stock & record audit movements
async function deductStockForOrder(order) {
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (variant) {
        const previousStock = variant.stockQuantity;
        variant.stockQuantity = Math.max(previousStock - item.quantity, 0);
        await product.save();

        await InventoryMovement.create({
          productId: product._id,
          sku: item.variantSku,
          quantityChange: -item.quantity,
          previousStock,
          newStock: variant.stockQuantity,
          reason: "order_placed",
          referenceId: order.orderNumber,
          performedBy: "customer_checkout",
        });
      }
    }
  }
}

// POST /api/checkout/calculate-summary
router.post("/calculate-summary", async (req, res) => {
  try {
    const { items, paymentMethod, couponCode } = req.body;
    const summary = await calculateOrderPricing(
      items,
      paymentMethod || "prepaid",
      couponCode || ""
    );
    res.json(summary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/checkout/razorpay-config
router.get("/razorpay-config", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  res.json({
    keyId,
    configured: Boolean(keyId && process.env.RAZORPAY_KEY_SECRET),
    isLive: Boolean(keyId && !keyId.startsWith("rzp_test_")),
  });
});

// POST /api/checkout/create-razorpay-order
router.post("/create-razorpay-order", requireCustomerAuth, async (req, res) => {
  try {
    const { items, shippingAddress, couponCode, notes } = req.body;
    const customer = customerFromUser(req.user);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ message: "Shipping address with city and pincode is required" });
    }

    // Calculate server pricing
    const calculation = await calculateOrderPricing(items, "prepaid", couponCode);
    const orderNumber = generateOrderNumber();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        message: "Razorpay credentials are not configured on server (.env).",
      });
    }

    // Create real Razorpay order on Razorpay servers
    let rzpOrder;
    try {
      rzpOrder = await createRzpOrder({
        amountPaise: calculation.pricing.totalPaise,
        currency: "INR",
        receipt: orderNumber,
        notes: {
          orderNumber,
          customerName: customer.fullName,
          customerPhone: customer.phone,
        },
      });
    } catch (rzpErr) {
      console.error("Razorpay order creation failed:", rzpErr);
      return res.status(502).json({
        message: `Failed to initialize Razorpay payment gateway: ${rzpErr.message}`,
      });
    }

    const finalShippingAddress = {
      fullName: shippingAddress.fullName || customer.fullName,
      phone: shippingAddress.phone || customer.phone,
      ...shippingAddress,
    };

    // Create order record in DB with pending_payment status
    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      customer,
      shippingAddress: finalShippingAddress,
      items: calculation.items,
      pricing: calculation.pricing,
      paymentMethod: "prepaid",
      paymentDetails: {
        gateway: "razorpay",
        razorpayOrderId: rzpOrder.id,
        status: "pending",
      },
      orderStatus: "pending_payment",
      statusHistory: [
        {
          status: "pending_payment",
          note: `Order initiated. Razorpay Order ${rzpOrder.id} generated for ₹${(
            calculation.pricing.totalPaise / 100
          ).toFixed(2)}.`,
          changedBy: "customer_checkout",
        },
      ],
      notes: notes || "",
    });

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amountPaise: calculation.pricing.totalPaise,
      currency: "INR",
      keyId,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
      pricing: calculation.pricing,
    });
  } catch (error) {
    console.error("Create prepaid order error:", error);
    res.status(400).json({ message: error.message || "Failed to initialize payment" });
  }
});

// POST /api/checkout/verify-razorpay-payment
router.post("/verify-razorpay-payment", requireCustomerAuth, async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        message: "Missing Razorpay verification parameters (order ID, payment ID, signature).",
      });
    }

    const query = orderId
      ? { _id: orderId }
      : { "paymentDetails.razorpayOrderId": razorpayOrderId };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (!assertOrderOwner(order, req.user)) {
      return res.status(403).json({ message: "This order does not belong to your account." });
    }

    // Idempotency: If already verified and marked paid, return success
    if (order.paymentDetails?.status === "paid") {
      return res.json({
        success: true,
        message: "Payment already verified and order confirmed",
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentDetails.status,
          invoiceNumber: order.invoiceNumber,
          pricing: order.pricing,
          items: order.items,
          customer: order.customer,
          shippingAddress: order.shippingAddress,
        },
      });
    }

    // Cryptographic HMAC SHA256 Signature verification
    const isAuthentic = verifyRzpSig({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isAuthentic) {
      order.paymentDetails.status = "failed";
      order.paymentDetails.failedAt = new Date();
      order.paymentDetails.failureReason = "Cryptographic signature verification mismatch";
      order.paymentDetails.errorCode = "SIGNATURE_VERIFICATION_FAILED";
      order.orderStatus = "cancelled";
      order.statusHistory.push({
        status: "cancelled",
        note: "Online payment failed signature verification.",
        changedBy: "razorpay_gateway",
      });
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Signature mismatch. Potential fraud or corrupted request.",
      });
    }

    // Fetch optional payment metadata from Razorpay (method, card brand, bank)
    const rzpPaymentDetails = await fetchRazorpayPayment(razorpayPaymentId);

    // Payment officially verified
    const invoiceNum = await assignInvoiceNumber();

    order.paymentDetails.status = "paid";
    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpayOrderId = razorpayOrderId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    order.paymentDetails.paidAt = new Date();
    order.orderStatus = "confirmed";
    order.invoiceNumber = invoiceNum;
    order.invoiceDate = new Date();

    const paymentMethodInfo = rzpPaymentDetails?.method
      ? ` via ${rzpPaymentDetails.method.toUpperCase()}`
      : "";

    order.statusHistory.push({
      status: "confirmed",
      note: `Payment confirmed via Razorpay (${razorpayPaymentId}${paymentMethodInfo}). Invoice ${invoiceNum} generated.`,
      changedBy: "razorpay_gateway",
    });

    await order.save();

    // Deduct stock for verified order
    await deductStockForOrder(order);

    res.json({
      success: true,
      message: "Payment verified and order confirmed",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentDetails.status,
        paymentId: razorpayPaymentId,
        invoiceNumber: order.invoiceNumber,
        pricing: order.pricing,
        items: order.items,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: error.message || "Could not verify payment" });
  }
});

// POST /api/checkout/record-razorpay-failure
router.post("/record-razorpay-failure", requireCustomerAuth, async (req, res) => {
  try {
    const { orderId, razorpayOrderId, error } = req.body;

    const query = orderId
      ? { _id: orderId }
      : { "paymentDetails.razorpayOrderId": razorpayOrderId };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (!assertOrderOwner(order, req.user)) {
      return res.status(403).json({ message: "This order does not belong to your account." });
    }

    // If already paid, do not mark as failed
    if (order.paymentDetails?.status === "paid") {
      return res.json({ success: true, message: "Order is already paid", order });
    }

    const failureDescription =
      error?.description ||
      error?.reason ||
      error?.metadata?.payment_id ||
      "Payment was cancelled or rejected by customer/bank";

    order.paymentDetails.status = "failed";
    order.paymentDetails.failedAt = new Date();
    order.paymentDetails.failureReason = failureDescription;
    order.paymentDetails.errorCode = error?.code || "PAYMENT_FAILED";
    order.paymentDetails.errorDescription = error?.description || failureDescription;
    if (error?.metadata?.payment_id) {
      order.paymentDetails.razorpayPaymentId = error.metadata.payment_id;
    }
    order.orderStatus = "cancelled";

    order.statusHistory.push({
      status: "cancelled",
      note: `Online payment failed: ${failureDescription}`,
      changedBy: "razorpay_gateway",
      changedAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Payment failure recorded in database",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentDetails.status,
        failureReason: order.paymentDetails.failureReason,
      },
    });
  } catch (err) {
    console.error("Record payment failure error:", err);
    res.status(500).json({ message: err.message || "Could not record payment failure" });
  }
});

// POST /api/checkout/cod-order
router.post("/cod-order", requireCustomerAuth, async (req, res) => {
  try {
    const { items, shippingAddress, couponCode, notes } = req.body;
    const customer = customerFromUser(req.user);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ message: "Shipping address with city and pincode is required" });
    }

    // Server-side calculation with COD rules
    const calculation = await calculateOrderPricing(items, "cod", couponCode);
    const finalShippingAddress = {
      fullName: shippingAddress.fullName || customer.fullName,
      phone: shippingAddress.phone || customer.phone,
      ...shippingAddress,
    };

    const orderNumber = generateOrderNumber();
    const invoiceNum = await assignInvoiceNumber();

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      customer,
      shippingAddress: finalShippingAddress,
      items: calculation.items,
      pricing: calculation.pricing,
      paymentMethod: "cod",
      paymentDetails: {
        gateway: "cod",
        status: "pending", // COD payment collected upon delivery
      },
      orderStatus: "confirmed",
      invoiceNumber: invoiceNum,
      invoiceDate: new Date(),
      statusHistory: [
        {
          status: "confirmed",
          note: `COD Order confirmed. Amount to be collected on delivery: ₹${(
            calculation.pricing.totalPaise / 100
          ).toFixed(2)}. Invoice ${invoiceNum} generated.`,
          changedBy: "customer_checkout",
        },
      ],
      notes: notes || "",
    });

    // Deduct stock
    await deductStockForOrder(order);

    res.status(201).json({
      success: true,
      message: "Cash on Delivery order placed successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentDetails.status,
        invoiceNumber: order.invoiceNumber,
        pricing: order.pricing,
        items: order.items,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (error) {
    console.error("COD checkout error:", error);
    res.status(400).json({ message: error.message || "Could not place COD order" });
  }
});

export default router;
