import { api } from "./api.js";

/**
 * Ensures the Razorpay checkout script is loaded in the window.
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Opens the native Razorpay modal for online payment.
 * Automatically handles:
 * - Payment success verification with server (HMAC SHA256)
 * - Payment failure callback & database status update
 * - User modal dismissal & cancellation status update
 *
 * @param {Object} params
 * @param {Object} params.orderData - Data returned by api.createRazorpayOrder
 * @param {Object} params.customer - Customer object { fullName, email, phone }
 * @param {Function} params.onSuccess - Callback invoked on verified order
 * @param {Function} params.onFailure - Callback invoked on payment failure
 * @param {Function} [params.onDismiss] - Optional callback when user dismisses modal
 */
export const launchRazorpayCheckout = async ({
  orderData,
  customer,
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error(
      "Razorpay SDK could not be loaded. Please check your internet connection or ad-blocker."
    );
  }

  const { orderId, orderNumber, razorpayOrderId, amountPaise, currency, keyId } = orderData;

  const options = {
    key: keyId,
    amount: amountPaise,
    currency: currency || "INR",
    name: "Shopecomira",
    description: `Order #${orderNumber}`,
    order_id: razorpayOrderId,
    prefill: {
      name: customer?.fullName || "",
      email: customer?.email || "",
      contact: customer?.phone || "",
    },
    notes: {
      orderNumber,
    },
    theme: {
      color: "#6366f1", // Brand accent indigo
    },
    modal: {
      confirm_close: true,
      ondismiss: async () => {
        try {
          await api.recordRazorpayFailure({
            orderId,
            razorpayOrderId,
            error: {
              code: "USER_DISMISSED",
              description: "Customer cancelled payment checkout modal",
            },
          });
        } catch (err) {
          console.warn("Could not record dismissal failure:", err);
        }

        if (onDismiss) {
          onDismiss();
        } else if (onFailure) {
          onFailure({
            reason: "USER_CANCELLED",
            description: "Payment was cancelled. You can retry payment or select Cash on Delivery.",
          });
        }
      },
    },
    handler: async (response) => {
      // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      try {
        const verifyRes = await api.verifyRazorpayPayment({
          orderId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        if (verifyRes.success && verifyRes.order) {
          onSuccess(verifyRes.order);
        } else {
          throw new Error(verifyRes.message || "Payment verification failed.");
        }
      } catch (err) {
        console.error("Razorpay verification failed on client:", err);
        onFailure({
          reason: "VERIFICATION_ERROR",
          description: err.message || "Payment verification failed. Please contact support.",
        });
      }
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", async (response) => {
    // response.error: { code, description, source, step, reason, metadata: { payment_id, order_id } }
    console.error("Razorpay payment failed:", response.error);

    try {
      await api.recordRazorpayFailure({
        orderId,
        razorpayOrderId,
        error: response.error,
      });
    } catch (err) {
      console.warn("Could not record payment failure to server:", err);
    }

    onFailure({
      reason: response.error?.reason || "PAYMENT_FAILED",
      description:
        response.error?.description ||
        "Payment could not be completed by your bank/UPI. Please try again or choose COD.",
      code: response.error?.code,
      metadata: response.error?.metadata,
    });
  });

  rzp.open();
};

export default {
  loadRazorpayScript,
  launchRazorpayCheckout,
};
