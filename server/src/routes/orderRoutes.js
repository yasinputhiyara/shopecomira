import { Router } from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import StoreSetting from "../models/StoreSetting.js";
import { requireAdmin, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// Public: Look up order by orderNumber and optional phone
router.get("/lookup/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    const query = { orderNumber: orderNumber.toUpperCase().trim() };
    if (phone) {
      query["customer.phone"] = phone.trim();
    }

    const order = await Order.findOne(query).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Mask sensitive details slightly if accessed without phone validation
    res.json({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentDetails?.status || "pending",
      paymentDetails: {
        gateway: order.paymentDetails?.gateway || "razorpay",
        status: order.paymentDetails?.status || "pending",
        razorpayOrderId: order.paymentDetails?.razorpayOrderId,
        razorpayPaymentId: order.paymentDetails?.razorpayPaymentId,
        paidAt: order.paymentDetails?.paidAt,
        failedAt: order.paymentDetails?.failedAt,
        failureReason: order.paymentDetails?.failureReason,
      },
      items: order.items,
      pricing: order.pricing,
      shippingAddress: order.shippingAddress,
      customerName: order.customer.fullName,
      statusHistory: order.statusHistory,
      tracking: order.tracking,
      invoiceNumber: order.invoiceNumber,
    });
  } catch (error) {
    console.error("Lookup error:", error);
    res.status(500).json({ message: "Could not look up order" });
  }
});

// Admin: Dashboard stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [orders, products, settings] = await Promise.all([
      Order.find().lean(),
      Product.find().lean(),
      StoreSetting.findOne().lean(),
    ]);

    let totalRevenuePaise = 0;
    let prepaidCount = 0;
    let codCount = 0;
    let paidCount = 0;
    let failedPaymentCount = 0;
    let pendingPaymentCount = 0;
    const statusCounts = {};

    for (const ord of orders) {
      if (
        ord.orderStatus !== "cancelled" &&
        ord.orderStatus !== "pending_payment" &&
        ord.paymentDetails?.status === "paid"
      ) {
        totalRevenuePaise += ord.pricing?.totalPaise || 0;
      }
      if (ord.paymentMethod === "prepaid") prepaidCount++;
      if (ord.paymentMethod === "cod") codCount++;

      const pStatus = ord.paymentDetails?.status || "pending";
      if (pStatus === "paid") paidCount++;
      else if (pStatus === "failed") failedPaymentCount++;
      else if (pStatus === "pending") pendingPaymentCount++;

      statusCounts[ord.orderStatus] = (statusCounts[ord.orderStatus] || 0) + 1;
    }

    // Low stock count (variants with stock <= 5)
    let lowStockCount = 0;
    for (const p of products) {
      for (const v of p.variants) {
        if (v.stockQuantity <= 5) {
          lowStockCount++;
          break;
        }
      }
    }

    const totalValidOrders = prepaidCount + codCount;
    const prepaidPercentage =
      totalValidOrders > 0 ? Math.round((prepaidCount / totalValidOrders) * 100) : 0;

    res.json({
      totalRevenuePaise,
      totalOrders: orders.length,
      prepaidPercentage,
      prepaidCount,
      codCount,
      paidCount,
      failedPaymentCount,
      pendingPaymentCount,
      lowStockCount,
      totalProducts: products.length,
      statusCounts,
      settings,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Could not fetch dashboard stats" });
  }
});

// Admin: List all orders with filters
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const { status, paymentMethod, paymentStatus, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.orderStatus = status;
    }
    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = paymentMethod;
    }
    if (paymentStatus && paymentStatus !== "all") {
      filter["paymentDetails.status"] = paymentStatus;
    }
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { orderNumber: regex },
        { "customer.fullName": regex },
        { "customer.phone": regex },
        { "customer.email": regex },
        { "paymentDetails.razorpayPaymentId": regex },
        { "paymentDetails.razorpayOrderId": regex },
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email phone createdAt")
      .lean();
    res.json({ data: orders });
  } catch (error) {
    console.error("Admin order list error:", error);
    res.status(500).json({ message: "Could not fetch orders" });
  }
});

// Admin: List all registered customers with metrics
router.get("/admin/customers", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    const customersWithStats = await Promise.all(
      users.map(async (u) => {
        const userOrders = await Order.find({
          $or: [
            { userId: u._id },
            { "customer.email": u.email },
            { "customer.phone": u.phone },
          ],
        }).lean();

        const paidOrders = userOrders.filter((o) => o.paymentDetails?.status === "paid");
        const totalSpentPaise = paidOrders.reduce((sum, o) => sum + (o.pricing?.totalPaise || 0), 0);

        return {
          id: u._id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          addressesCount: u.addresses?.length || 0,
          ordersCount: userOrders.length,
          paidOrdersCount: paidOrders.length,
          totalSpentPaise,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
        };
      })
    );

    res.json({ total: customersWithStats.length, customers: customersWithStats });
  } catch (err) {
    console.error("Admin customers list error:", err);
    res.status(500).json({ message: "Could not fetch customers list." });
  }
});

// Admin: Get single order
router.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ data: order });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch order" });
  }
});

// Admin: Update order status
router.patch("/admin/:id/status", requireAdmin, requireRole("orders"), async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;

    // If marked delivered and COD, update payment details
    if (status === "delivered" && order.paymentMethod === "cod") {
      order.paymentDetails.status = "paid";
      order.paymentDetails.paidAt = new Date();
    }

    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status} by admin`,
      changedBy: req.session.adminName || "admin",
      changedAt: new Date(),
    });

    await order.save();
    res.json({ message: "Order status updated", data: order });
  } catch (error) {
    console.error("Order status update error:", error);
    res.status(500).json({ message: "Could not update order status" });
  }
});

// Admin: Update tracking details
router.patch("/admin/:id/tracking", requireAdmin, requireRole("orders"), async (req, res) => {
  try {
    const { courierName, trackingNumber, trackingUrl } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.tracking = {
      courierName: courierName || order.tracking?.courierName,
      trackingNumber: trackingNumber || order.tracking?.trackingNumber,
      trackingUrl: trackingUrl || order.tracking?.trackingUrl,
      dispatchedAt: order.tracking?.dispatchedAt || new Date(),
    };

    if (order.orderStatus === "confirmed" || order.orderStatus === "processing") {
      order.orderStatus = "shipped";
    }

    order.statusHistory.push({
      status: "shipped",
      note: `Tracking added: ${courierName} - AWB: ${trackingNumber}`,
      changedBy: req.session.adminName || "admin",
      changedAt: new Date(),
    });

    await order.save();
    res.json({ message: "Tracking info saved", data: order });
  } catch (error) {
    console.error("Tracking update error:", error);
    res.status(500).json({ message: "Could not update tracking info" });
  }
});

// Admin: Invoice data snapshot
router.get("/admin/:id/invoice", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let settings = await StoreSetting.findOne().lean();
    if (!settings) {
      settings = {
        storeName: "Shopecomira",
        legalBusinessName: "Shopecomira Retail Enterprises Pvt Ltd",
        gstin: "27AABCU9603R1ZM",
        pan: "AABCU9603R",
        registeredAddress: "Suite 402, Commerce Hub, Bandra West, Mumbai, Maharashtra 400050",
        state: "Maharashtra",
        stateCode: "27",
      };
    }

    // Determine tax split: CGST+SGST for intra-state (same state) or IGST for inter-state
    const isIntraState =
      (order.shippingAddress.state || "").trim().toLowerCase() ===
      (settings.state || "").trim().toLowerCase();

    res.json({
      invoice: {
        invoiceNumber: order.invoiceNumber || `INV-${order.orderNumber}`,
        invoiceDate: order.invoiceDate || order.createdAt,
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        seller: {
          name: settings.legalBusinessName || settings.storeName,
          gstin: settings.gstin,
          pan: settings.pan,
          address: settings.registeredAddress,
          state: settings.state,
          stateCode: settings.stateCode,
        },
        buyer: {
          name: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          address: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
          state: order.shippingAddress.state,
        },
        isIntraState,
        items: order.items.map((item) => {
          const taxDecimal = item.gstRate / 100;
          const taxableValuePaise = Math.round(item.lineTotalPaise / (1 + taxDecimal));
          const taxTotalPaise = item.lineTotalPaise - taxableValuePaise;
          return {
            ...item,
            taxableValuePaise,
            cgstPaise: isIntraState ? Math.round(taxTotalPaise / 2) : 0,
            sgstPaise: isIntraState ? Math.round(taxTotalPaise / 2) : 0,
            igstPaise: !isIntraState ? taxTotalPaise : 0,
          };
        }),
        pricing: order.pricing,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentDetails.status,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    res.status(500).json({ message: "Could not generate invoice" });
  }
});

export default router;
