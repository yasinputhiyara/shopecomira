import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.warn("⚠️ Razorpay API keys missing in environment variables.");
      return null;
    }

    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
};

/**
 * Creates an order on Razorpay servers
 * @param {Object} params - { amountPaise, currency, receipt, notes }
 * @returns {Promise<Object>} Razorpay order object
 */
export const createRazorpayOrder = async ({ amountPaise, currency = "INR", receipt, notes = {} }) => {
  const instance = getRazorpayInstance();
  if (!instance) {
    throw new Error("Razorpay instance not initialized. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return await instance.orders.create({
    amount: Math.round(amountPaise),
    currency,
    receipt,
    notes,
  });
};

/**
 * Verifies authenticity of Razorpay payment signature
 * @param {Object} params - { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * @returns {boolean} Whether signature is authentic
 */
export const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

/**
 * Fetches transaction details directly from Razorpay
 * @param {string} paymentId
 * @returns {Promise<Object|null>}
 */
export const fetchRazorpayPayment = async (paymentId) => {
  const instance = getRazorpayInstance();
  if (!instance || !paymentId) return null;
  try {
    return await instance.payments.fetch(paymentId);
  } catch (error) {
    console.error("Error fetching payment from Razorpay:", error.message);
    return null;
  }
};

export default {
  getRazorpayInstance,
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchRazorpayPayment,
};
