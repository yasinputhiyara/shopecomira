// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://your-backend.onrender.com/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = { ...(options.headers || {}) };
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers,
    credentials: "include", // send session cookie
  };

  if (options.body && typeof options.body === "object" && !isFormData) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Public Storefront
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ""}`);
  },
  getProductBySlug: (slug) => request(`/products/${slug}`),
  getCategories: () => request("/categories"),
  getActiveOffers: () => request("/offers/active"),
  getPublicSettings: () => request("/settings/public"),

  // Checkout & Pricing
  calculateSummary: (items, paymentMethod = "prepaid", couponCode = "") =>
    request("/checkout/calculate-summary", {
      method: "POST",
      body: { items, paymentMethod, couponCode },
    }),
  createRazorpayOrder: (payload) =>
    request("/checkout/create-razorpay-order", {
      method: "POST",
      body: payload,
    }),
  verifyRazorpayPayment: (payload) =>
    request("/checkout/verify-razorpay-payment", {
      method: "POST",
      body: payload,
    }),
  recordRazorpayFailure: (payload) =>
    request("/checkout/record-razorpay-failure", {
      method: "POST",
      body: payload,
    }),
  getRazorpayConfig: () => request("/checkout/razorpay-config"),
  placeCodOrder: (payload) =>
    request("/checkout/cod-order", {
      method: "POST",
      body: payload,
    }),

  // Order Lookup
  lookupOrder: (orderNumber, phone = "") =>
    request(`/orders/lookup/${orderNumber}${phone ? `?phone=${phone}` : ""}`),

  // Customer Auth & Account
  sendRegisterOtp: (data) =>
    request("/user/register/send-otp", {
      method: "POST",
      body: data,
    }),
  verifyRegisterOtp: (data) =>
    request("/user/register/verify-otp", {
      method: "POST",
      body: data,
    }),
  resendRegisterOtp: (email) =>
    request("/user/register/resend-otp", {
      method: "POST",
      body: { email },
    }),
  userLogin: (data) =>
    request("/user/login", {
      method: "POST",
      body: data,
    }),
  userLogout: () =>
    request("/user/logout", {
      method: "POST",
    }),
  userMe: () => request("/user/me"),
  updateUserProfile: (data) =>
    request("/user/profile", {
      method: "PUT",
      body: data,
    }),
  addUserAddress: (data) =>
    request("/user/addresses", {
      method: "POST",
      body: data,
    }),
  updateUserAddress: (id, data) =>
    request(`/user/addresses/${id}`, {
      method: "PUT",
      body: data,
    }),
  deleteUserAddress: (id) =>
    request(`/user/addresses/${id}`, {
      method: "DELETE",
    }),
  getUserOrders: () => request("/user/orders"),
  getUserOrder: (orderNumber) => request(`/user/orders/${orderNumber}`),
  getAdminCustomers: () => request("/orders/admin/customers"),

  // Admin Auth
  adminLogin: (email, password) =>
    request("/admin/login", {
      method: "POST",
      body: { email, password },
    }),
  adminLogout: () =>
    request("/admin/logout", {
      method: "POST",
    }),
  adminMe: () => request("/admin/me"),

  // Admin Operations
  getAdminStats: () => request("/orders/admin/stats"),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders/admin/all${query ? `?${query}` : ""}`);
  },
  updateOrderStatus: (id, status, note) =>
    request(`/orders/admin/${id}/status`, {
      method: "PATCH",
      body: { status, note },
    }),
  updateOrderTracking: (id, trackingData) =>
    request(`/orders/admin/${id}/tracking`, {
      method: "PATCH",
      body: trackingData,
    }),
  getOrderInvoice: (id) => request(`/orders/admin/${id}/invoice`),

  // Admin Catalogue
  getAdminProducts: () => request("/products/admin/all"),
  createProduct: (data) =>
    request("/products", {
      method: "POST",
      body: data,
    }),
  updateProduct: (id, data) =>
    request(`/products/${id}`, {
      method: "PUT",
      body: data,
    }),
  uploadProductImages: (formData) =>
    request("/products/upload-images", {
      method: "POST",
      body: formData,
    }),
  deleteProductImage: (publicId) =>
    request("/products/delete-image", {
      method: "POST",
      body: { publicId },
    }),
  toggleBlockProduct: (id) =>
    request(`/products/${id}/toggle-block`, {
      method: "PATCH",
    }),
  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: "DELETE",
    }),
  adjustStock: (id, sku, quantityChange, reason) =>
    request(`/products/${id}/stock`, {
      method: "PATCH",
      body: { sku, quantityChange, reason },
    }),

  // Admin Settings & Offers
  getAdminSettings: () => request("/settings"),
  updateAdminSettings: (data) =>
    request("/settings", {
      method: "PUT",
      body: data,
    }),
  getAdminCategories: () => request("/categories/all"),
  createCategory: (data) =>
    request("/categories", {
      method: "POST",
      body: data,
    }),
  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: "DELETE",
    }),
  getAdminOffers: () => request("/offers/admin/all"),
  createOffer: (data) =>
    request("/offers", {
      method: "POST",
      body: data,
    }),
  deleteOffer: (id) =>
    request(`/offers/${id}`, {
      method: "DELETE",
    }),
  updateOffer: (id, data) =>
    request(`/offers/${id}`, {
      method: "PUT",
      body: data,
    }),
};








