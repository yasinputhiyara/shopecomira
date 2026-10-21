import Offer from "../models/Offer.js";
import StoreSetting from "../models/StoreSetting.js";
import Product from "../models/Product.js";

/**
 * Calculates deterministic pricing and discounts for cart items.
 * All monetary amounts are in integer paise.
 *
 * @param {Array} rawItems - [{ productId, variantSku, quantity }]
 * @param {String} paymentMethod - 'prepaid' | 'cod'
 * @param {String} couponCode - optional coupon string
 */
export async function calculateOrderPricing(rawItems, paymentMethod = "prepaid", couponCode = "") {
  if (!rawItems || rawItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Load store settings
  let settings = await StoreSetting.findOne().lean();
  if (!settings) {
    settings = {
      freeShippingThresholdPaise: 99900,
      standardShippingFeePaise: 7000,
      codFeePaise: 5000,
      prepaidDiscountPercent: 5,
    };
  }

  // Fetch products and validate items
  const validatedItems = [];
  let subtotalPaise = 0;
  let totalQuantity = 0;

  for (const item of rawItems) {
    const product = await Product.findById(item.productId).lean();
    if (!product || product.status !== "active") {
      throw new Error(`Product "${item.productId}" is not available.`);
    }

    const variant = product.variants.find((v) => v.sku === item.variantSku);
    if (!variant) {
      throw new Error(`Variant "${item.variantSku}" for ${product.name} not found.`);
    }

    const qty = Math.max(Number.parseInt(item.quantity, 10) || 1, 1);
    if (variant.stockQuantity < qty) {
      throw new Error(
        `Insufficient stock for "${product.name} (${variant.sku})". Only ${variant.stockQuantity} available.`
      );
    }

    const lineTotalPaise = variant.sellingPricePaise * qty;
    subtotalPaise += lineTotalPaise;
    totalQuantity += qty;

    validatedItems.push({
      productId: product._id,
      variantSku: variant.sku,
      productName: product.name,
      options: variant.options,
      imageUrl: product.images?.[0]?.url || "",
      mrpPaise: variant.mrpPaise,
      sellingPricePaise: variant.sellingPricePaise,
      quantity: qty,
      hsnCode: product.hsnCode,
      gstRate: product.gstRate,
      lineTotalPaise,
    });
  }

  // 1. Multi-Item Discount
  let multiItemDiscountPaise = 0;
  let appliedMultiItemTier = null;

  const multiItemOffer = await Offer.findOne({
    type: "multi_item",
    isActive: true,
  }).lean();

  if (multiItemOffer && multiItemOffer.tiers && multiItemOffer.tiers.length > 0) {
    // Sort tiers descending by minQuantity
    const sortedTiers = [...multiItemOffer.tiers].sort(
      (a, b) => b.minQuantity - a.minQuantity
    );

    for (const tier of sortedTiers) {
      if (totalQuantity >= tier.minQuantity) {
        multiItemDiscountPaise = Math.round(
          (subtotalPaise * tier.discountPercent) / 100
        );
        appliedMultiItemTier = tier;
        break;
      }
    }
  }

  let runningTotalPaise = Math.max(subtotalPaise - multiItemDiscountPaise, 0);

  // 2. Coupon Discount
  let couponDiscountPaise = 0;
  let validatedCoupon = null;
  let couponMessage = null;

  if (couponCode && couponCode.trim()) {
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = await Offer.findOne({
      type: "coupon",
      code: normalizedCode,
      isActive: true,
    }).lean();

    if (!coupon) {
      couponMessage = `Coupon "${normalizedCode}" is invalid or expired.`;
    } else if (coupon.minCartPaise && subtotalPaise < coupon.minCartPaise) {
      const minRs = Math.round(coupon.minCartPaise / 100);
      couponMessage = `Coupon "${normalizedCode}" requires a minimum order of ₹${minRs}.`;
    } else {
      if (coupon.discountPercent > 0) {
        couponDiscountPaise = Math.round(
          (runningTotalPaise * coupon.discountPercent) / 100
        );
        if (coupon.maxDiscountPaise && couponDiscountPaise > coupon.maxDiscountPaise) {
          couponDiscountPaise = coupon.maxDiscountPaise;
        }
      } else if (coupon.discountPaise > 0) {
        couponDiscountPaise = Math.min(coupon.discountPaise, runningTotalPaise);
      }

      validatedCoupon = normalizedCode;
      runningTotalPaise = Math.max(runningTotalPaise - couponDiscountPaise, 0);
    }
  }

  // 3. Prepaid Discount (Applies only when paymentMethod is 'prepaid')
  let prepaidDiscountPaise = 0;
  const prepaidDiscountPercent = settings.prepaidDiscountPercent || 5;

  if (paymentMethod === "prepaid" && prepaidDiscountPercent > 0) {
    prepaidDiscountPaise = Math.round(
      (runningTotalPaise * prepaidDiscountPercent) / 100
    );
    runningTotalPaise = Math.max(runningTotalPaise - prepaidDiscountPaise, 0);
  }

  // 4. Shipping Fee
  let shippingFeePaise = 0;
  if (subtotalPaise < settings.freeShippingThresholdPaise) {
    shippingFeePaise = settings.standardShippingFeePaise || 7000;
  }

  // 5. COD Handling Fee (Applies only when paymentMethod is 'cod')
  let codFeePaise = 0;
  if (paymentMethod === "cod") {
    codFeePaise = settings.codFeePaise || 5000;
  }

  // 6. Tax Calculation (GST breakdown for invoice)
  // Since selling prices include GST, we back-calculate the tax for each item
  let totalTaxAmountPaise = 0;
  const totalDiscountsPaise =
    multiItemDiscountPaise + couponDiscountPaise + prepaidDiscountPaise;
  const discountRatio = subtotalPaise > 0 ? (subtotalPaise - totalDiscountsPaise) / subtotalPaise : 1;

  for (const item of validatedItems) {
    const discountedItemLinePaise = Math.round(item.lineTotalPaise * discountRatio);
    const taxRateDecimal = item.gstRate / 100;
    const taxableBasePaise = Math.round(discountedItemLinePaise / (1 + taxRateDecimal));
    const itemTaxPaise = discountedItemLinePaise - taxableBasePaise;
    totalTaxAmountPaise += itemTaxPaise;
  }

  const finalTotalPaise =
    runningTotalPaise + shippingFeePaise + codFeePaise;

  return {
    items: validatedItems,
    pricing: {
      subtotalPaise,
      multiItemDiscountPaise,
      appliedMultiItemTier,
      couponCode: validatedCoupon,
      couponDiscountPaise,
      couponMessage,
      prepaidDiscountPaise,
      prepaidDiscountPercent: paymentMethod === "prepaid" ? prepaidDiscountPercent : 0,
      potentialPrepaidSavingsPaise:
        paymentMethod === "cod"
          ? Math.round(
              (Math.max(subtotalPaise - multiItemDiscountPaise - couponDiscountPaise, 0) *
                prepaidDiscountPercent) /
                100
            )
          : 0,
      shippingFeePaise,
      freeShippingThresholdPaise: settings.freeShippingThresholdPaise,
      codFeePaise,
      taxAmountPaise: totalTaxAmountPaise,
      totalPaise: Math.max(finalTotalPaise, 0),
    },
    paymentMethod,
  };
}
