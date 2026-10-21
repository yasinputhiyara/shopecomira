import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Percent,
  Settings,
  LogOut,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Plus,
  Edit,
  Truck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { api } from "../services/api.js";

export default function AdminPortalModal({
  isOpen,
  onClose,
  onViewInvoice,
}) {
  if (!isOpen) return null;

  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | orders | products | settings

  // Login form
  const [email, setEmail] = useState("admin@shopecomira.com");
  const [password, setPassword] = useState("Admin@12345");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Dashboard Data
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeSettings, setStoreSettings] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Filter & Search states
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");

  // Modals inside admin
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({ courierName: "Delhivery", trackingNumber: "", trackingUrl: "" });
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [adjustStockProduct, setAdjustStockProduct] = useState(null);
  const [stockForm, setStockForm] = useState({ sku: "", quantityChange: 10, reason: "restock" });

  // Add product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    brand: "",
    category: "",
    hsnCode: "8518",
    gstRate: 18,
    shortDescription: "",
    imageUrl: "",
    variantSku: "",
    variantOptionValue: "Standard",
    mrp: 2999,
    sellingPrice: 1299,
    stock: 25,
  });

  // Check admin session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await api.adminMe();
      if (res?.admin) {
        setAdmin(res.admin);
        loadDashboardData();
      }
    } catch {
      setAdmin(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await api.adminLogin(email, password);
      setAdmin(res.admin);
      setAuthLoading(false);
      loadDashboardData();
    } catch (err) {
      setAuthLoading(false);
      setAuthError(err.message || "Invalid credentials");
    }
  };

  const handleLogout = async () => {
    try {
      await api.adminLogout();
      setAdmin(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, settingsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminProducts(),
        api.getCategories(),
        api.getAdminSettings(),
      ]);

      setStats(statsRes);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setStoreSettings(settingsRes.data || {});
      setDataLoading(false);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setDataLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus}`);
      loadDashboardData();
    } catch (err) {
      alert(err.message || "Could not update status");
    }
  };

  // Submit tracking details
  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    try {
      await api.updateOrderTracking(trackingModalOrder._id, trackingForm);
      setTrackingModalOrder(null);
      loadDashboardData();
    } catch (err) {
      alert(err.message || "Failed to update tracking");
    }
  };

  // Create product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct({
        name: newProduct.name,
        slug: newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        brand: newProduct.brand,
        category: newProduct.category || categories[0]?._id,
        hsnCode: newProduct.hsnCode,
        gstRate: Number(newProduct.gstRate),
        shortDescription: newProduct.shortDescription,
        images: [{ url: newProduct.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80" }],
        variants: [
          {
            sku: newProduct.variantSku || `${newProduct.brand.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            options: [{ name: "Model", value: newProduct.variantOptionValue }],
            mrpPaise: Math.round(Number(newProduct.mrp) * 100),
            sellingPricePaise: Math.round(Number(newProduct.sellingPrice) * 100),
            stockQuantity: Number(newProduct.stock),
          },
        ],
      });
      setShowAddProductModal(false);
      loadDashboardData();
    } catch (err) {
      alert(err.message || "Could not create product");
    }
  };

  // Adjust stock
  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustStockProduct) return;
    try {
      await api.adjustStock(
        adjustStockProduct._id,
        stockForm.sku,
        stockForm.quantityChange,
        stockForm.reason
      );
      setAdjustStockProduct(null);
      loadDashboardData();
    } catch (err) {
      alert(err.message || "Could not update stock");
    }
  };

  // Save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings(storeSettings);
      alert("Settings updated successfully!");
      loadDashboardData();
    } catch (err) {
      alert(err.message || "Could not save settings");
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "all" && o.orderStatus !== orderStatusFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const matchName = o.customer?.fullName?.toLowerCase().includes(q);
      const matchPhone = o.customer?.phone?.includes(q);
      return matchNum || matchName || matchPhone;
    }
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 1100, minHeight: 620, padding: 0, overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header Bar */}
        <div
          style={{
            background: "var(--bg-surface-elevated)",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border-medium)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "8px",
                background: "var(--accent-indigo)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem" }}>Shopecomira Admin Portal</h3>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Commerce Operations & Catalogue Control
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {admin && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {admin.name} ({admin.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  title="Sign out"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
            <button className="modal-close-btn" style={{ position: "static" }} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {!admin ? (
          /* Admin Login Form */
          <div style={{ maxWidth: 420, margin: "4rem auto", padding: "0 1.5rem", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-indigo)",
                margin: "0 auto 1.25rem",
              }}
            >
              <Lock size={28} />
            </div>

            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>Admin Sign In</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Private access for catalogue, orders, and GST operations.
            </p>

            {authError && (
              <div
                style={{
                  background: "var(--accent-rose-bg)",
                  color: "var(--accent-rose)",
                  padding: "0.6rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.82rem",
                  marginBottom: "1rem",
                }}
              >
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", marginTop: "1rem", height: 44 }}
                disabled={authLoading}
              >
                {authLoading ? "Authenticating..." : "Sign In to Admin"}
              </button>

              <div
                style={{
                  background: "var(--bg-main)",
                  border: "1px dashed var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem",
                  marginTop: "1.5rem",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                <strong>Demo Credentials:</strong><br />
                Email: <code>admin@shopecomira.com</code><br />
                Password: <code>Admin@12345</code>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", height: "calc(90vh - 70px)" }}>
            {/* Sidebar Navigation */}
            <aside
              style={{
                background: "var(--bg-main)",
                borderRight: "1px solid var(--border-subtle)",
                padding: "1rem 0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <button
                className={`btn-nav-action ${activeTab === "overview" ? "active" : ""}`}
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  background: activeTab === "overview" ? "var(--bg-surface-elevated)" : "transparent",
                  color: activeTab === "overview" ? "#fff" : "var(--text-secondary)",
                }}
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard size={16} />
                <span>Overview</span>
              </button>

              <button
                className={`btn-nav-action ${activeTab === "orders" ? "active" : ""}`}
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  background: activeTab === "orders" ? "var(--bg-surface-elevated)" : "transparent",
                  color: activeTab === "orders" ? "#fff" : "var(--text-secondary)",
                }}
                onClick={() => setActiveTab("orders")}
              >
                <ShoppingBag size={16} />
                <span>Orders ({orders.length})</span>
              </button>

              <button
                className={`btn-nav-action ${activeTab === "products" ? "active" : ""}`}
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  background: activeTab === "products" ? "var(--bg-surface-elevated)" : "transparent",
                  color: activeTab === "products" ? "#fff" : "var(--text-secondary)",
                }}
                onClick={() => setActiveTab("products")}
              >
                <Package size={16} />
                <span>Catalogue ({products.length})</span>
              </button>

              <button
                className={`btn-nav-action ${activeTab === "settings" ? "active" : ""}`}
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  background: activeTab === "settings" ? "var(--bg-surface-elevated)" : "transparent",
                  color: activeTab === "settings" ? "#fff" : "var(--text-secondary)",
                }}
                onClick={() => setActiveTab("settings")}
              >
                <Settings size={16} />
                <span>Store & GST</span>
              </button>
            </aside>

            {/* Main Content Area */}
            <main style={{ padding: "1.5rem", overflowY: "auto" }}>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "1.25rem" }}>Store Performance & KPIs</h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                    <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Gross Sales Revenue</div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginTop: "0.2rem" }}>
                        ₹{(((stats?.totalRevenuePaise || 0) / 100)).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", marginTop: "0.25rem" }}>
                        From confirmed orders
                      </div>
                    </div>

                    <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Total Orders</div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginTop: "0.2rem" }}>
                        {stats?.totalOrders || 0}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        {stats?.prepaidCount || 0} Prepaid &bull; {stats?.codCount || 0} COD
                      </div>
                    </div>

                    <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Prepaid Conversion Share</div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: (stats?.prepaidPercentage || 0) >= 60 ? "var(--accent-emerald)" : "var(--accent-amber)", marginTop: "0.2rem" }}>
                        {stats?.prepaidPercentage || 0}%
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        PRD Target: &ge; 60%
                      </div>
                    </div>

                    <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Low Stock Warnings</div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: (stats?.lowStockCount || 0) > 0 ? "var(--accent-rose)" : "var(--accent-emerald)", marginTop: "0.2rem" }}>
                        {stats?.lowStockCount || 0}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        Variants &le; 5 units
                      </div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Recent Customer Orders</h4>
                  <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                          <th style={{ padding: "0.75rem 1rem" }}>Order #</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Customer</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Mode</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Total</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{ord.orderNumber}</td>
                            <td style={{ padding: "0.75rem 1rem" }}>{ord.customer?.fullName}</td>
                            <td style={{ padding: "0.75rem 1rem", textTransform: "uppercase" }}>{ord.paymentMethod}</td>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>₹{((ord.pricing?.totalPaise || 0) / 100).toLocaleString("en-IN")}</td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", background: "var(--bg-surface-elevated)" }}>
                                {ord.orderStatus}
                              </span>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <button
                                className="btn-secondary"
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                                onClick={() => onViewInvoice(ord)}
                              >
                                Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === "orders" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>Orders & Fulfilment Operations</h3>

                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="Search order #, customer, phone..."
                        className="form-control"
                        style={{ width: 220, height: 36, fontSize: "0.82rem" }}
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                      />
                      <select
                        className="form-control"
                        style={{ width: 140, height: 36, fontSize: "0.82rem" }}
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                          <th style={{ padding: "0.75rem 1rem" }}>Order Details</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Items</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Payment</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Total</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Status Lifecycle</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Tracking</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Documents</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                              No matching orders found
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => (
                            <tr key={ord._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                              <td style={{ padding: "0.75rem 1rem" }}>
                                <strong style={{ color: "var(--accent-indigo)" }}>{ord.orderNumber}</strong>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                  {ord.customer?.fullName} &bull; +91 {ord.customer?.phone}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                  {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                                </div>
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>
                                {ord.items?.map((it, idx) => (
                                  <div key={idx} style={{ fontSize: "0.78rem" }}>
                                    {it.productName} ({it.variantSku}) &times; {it.quantity}
                                  </div>
                                ))}
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>
                                <span style={{ textTransform: "uppercase", fontWeight: 600 }}>
                                  {ord.paymentMethod}
                                </span>
                                <div style={{ fontSize: "0.72rem", color: ord.paymentDetails?.status === "paid" ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                                  {ord.paymentDetails?.status?.toUpperCase()}
                                </div>
                              </td>

                              <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>
                                ₹{((ord.pricing?.totalPaise || 0) / 100).toLocaleString("en-IN")}
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>
                                <select
                                  value={ord.orderStatus}
                                  onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                                  className="form-control"
                                  style={{ padding: "0.3rem", fontSize: "0.78rem", height: 32 }}
                                >
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="out_for_delivery">Out for Delivery</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>
                                {ord.tracking?.trackingNumber ? (
                                  <div>
                                    <div style={{ fontWeight: 600 }}>{ord.tracking.courierName}</div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                      AWB: {ord.tracking.trackingNumber}
                                    </div>
                                    <button
                                      onClick={() => {
                                        setTrackingModalOrder(ord);
                                        setTrackingForm({
                                          courierName: ord.tracking.courierName,
                                          trackingNumber: ord.tracking.trackingNumber,
                                          trackingUrl: ord.tracking.trackingUrl || "",
                                        });
                                      }}
                                      style={{ color: "var(--accent-indigo)", fontSize: "0.72rem", textDecoration: "underline" }}
                                    >
                                      Edit Tracking
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn-secondary"
                                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                                    onClick={() => {
                                      setTrackingModalOrder(ord);
                                      setTrackingForm({ courierName: "BlueDart", trackingNumber: "", trackingUrl: "" });
                                    }}
                                  >
                                    <Truck size={12} />
                                    <span>Add Tracking</span>
                                  </button>
                                )}
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                                  onClick={() => onViewInvoice(ord)}
                                >
                                  <FileText size={12} />
                                  <span>GST Invoice</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CATALOGUE MANAGEMENT */}
              {activeTab === "products" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h3 style={{ fontSize: "1.2rem" }}>Catalogue & Inventory Control</h3>
                    <button
                      className="btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                      onClick={() => setShowAddProductModal(true)}
                    >
                      <Plus size={16} />
                      <span>Add Trending Product</span>
                    </button>
                  </div>

                  <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                          <th style={{ padding: "0.75rem 1rem" }}>Product</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Category</th>
                          <th style={{ padding: "0.75rem 1rem" }}>HSN & GST</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Selling Price</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Stock Level</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => {
                          const defVar = p.variants?.[0] || {};
                          const totalStock = p.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;
                          return (
                            <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                              <td style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <img
                                  src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=100&q=80"}
                                  alt=""
                                  style={{ width: 40, height: 40, borderRadius: "6px", objectFit: "cover" }}
                                />
                                <div>
                                  <strong style={{ color: "#fff" }}>{p.name}</strong>
                                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                    Brand: {p.brand} &bull; {p.variants?.length || 1} variants
                                  </div>
                                </div>
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>{p.category?.name || "General"}</td>
                              <td style={{ padding: "0.75rem 1rem" }}>
                                <div>HSN: {p.hsnCode}</div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>GST: {p.gstRate}%</div>
                              </td>

                              <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>
                                ₹{(((defVar.sellingPricePaise || 0) / 100)).toLocaleString("en-IN")}
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>
                                <span style={{ color: totalStock <= 5 ? "var(--accent-rose)" : "var(--accent-emerald)", fontWeight: 600 }}>
                                  {totalStock} units
                                </span>
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>
                                <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", background: "var(--bg-surface-elevated)" }}>
                                  {p.status}
                                </span>
                              </td>

                              <td style={{ padding: "0.75rem 1rem" }}>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                                  onClick={() => {
                                    setAdjustStockProduct(p);
                                    setStockForm({
                                      sku: p.variants?.[0]?.sku || "",
                                      quantityChange: 10,
                                      reason: "restock",
                                    });
                                  }}
                                >
                                  Stock Ledger
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: STORE & GST SETTINGS */}
              {activeTab === "settings" && storeSettings && (
                <div style={{ maxWidth: 700 }}>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "1.25rem" }}>Store Settings & GST Details</h3>

                  <form onSubmit={handleSaveSettings}>
                    <div className="form-group">
                      <label className="form-label">Store Brand Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={storeSettings.storeName || ""}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Legal Entity Name (for Tax Invoices)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={storeSettings.legalBusinessName || ""}
                        onChange={(e) => setStoreSettings({ ...storeSettings, legalBusinessName: e.target.value })}
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Seller GSTIN</label>
                        <input
                          type="text"
                          className="form-control"
                          value={storeSettings.gstin || ""}
                          onChange={(e) => setStoreSettings({ ...storeSettings, gstin: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Seller PAN</label>
                        <input
                          type="text"
                          className="form-control"
                          value={storeSettings.pan || ""}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pan: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Registered Business Address</label>
                      <textarea
                        rows={2}
                        className="form-control"
                        value={storeSettings.registeredAddress || ""}
                        onChange={(e) => setStoreSettings({ ...storeSettings, registeredAddress: e.target.value })}
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Support WhatsApp Number (International format)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="919876543210"
                          value={storeSettings.whatsappNumber || ""}
                          onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Prepaid Discount (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={storeSettings.prepaidDiscountPercent || 5}
                          onChange={(e) => setStoreSettings({ ...storeSettings, prepaidDiscountPercent: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Free Shipping Threshold (in ₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={(storeSettings.freeShippingThresholdPaise || 99900) / 100}
                          onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThresholdPaise: Number(e.target.value) * 100 })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Cash on Delivery Fee (in ₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={(storeSettings.codFeePaise || 5000) / 100}
                          onChange={(e) => setStoreSettings({ ...storeSettings, codFeePaise: Number(e.target.value) * 100 })}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>
                      Save Store Settings
                    </button>
                  </form>
                </div>
              )}
            </main>
          </div>
        )}

        {/* Modal: Add Courier Tracking */}
        {trackingModalOrder && (
          <div className="modal-overlay" style={{ zIndex: 120 }}>
            <div className="modal-content" style={{ maxWidth: 460, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1.1rem" }}>Update Shipping Tracking</h4>
                <button className="modal-close-btn" style={{ position: "static" }} onClick={() => setTrackingModalOrder(null)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveTracking}>
                <div className="form-group">
                  <label className="form-label">Courier Partner Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={trackingForm.courierName}
                    onChange={(e) => setTrackingForm({ ...trackingForm, courierName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">AWB Tracking Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEL782394829"
                    className="form-control"
                    value={trackingForm.trackingNumber}
                    onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Public Tracking Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://track.courier.com/..."
                    className="form-control"
                    value={trackingForm.trackingUrl}
                    onChange={(e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                  Save Tracking & Mark Shipped
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Adjust Variant Stock */}
        {adjustStockProduct && (
          <div className="modal-overlay" style={{ zIndex: 120 }}>
            <div className="modal-content" style={{ maxWidth: 460, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1.1rem" }}>Adjust Stock: {adjustStockProduct.name}</h4>
                <button className="modal-close-btn" style={{ position: "static" }} onClick={() => setAdjustStockProduct(null)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAdjustStock}>
                <div className="form-group">
                  <label className="form-label">Variant SKU</label>
                  <select
                    className="form-control"
                    value={stockForm.sku}
                    onChange={(e) => setStockForm({ ...stockForm, sku: e.target.value })}
                  >
                    {adjustStockProduct.variants.map((v) => (
                      <option key={v.sku} value={v.sku}>
                        {v.sku} - Stock: {v.stockQuantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity Change (+ for restock, - for audit write-off)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={stockForm.quantityChange}
                    onChange={(e) => setStockForm({ ...stockForm, quantityChange: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <select
                    className="form-control"
                    value={stockForm.reason}
                    onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  >
                    <option value="restock">Restock from Supplier</option>
                    <option value="manual_adjustment">Manual Inventory Adjustment</option>
                    <option value="return_restocked">Customer Return Restocked</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                  Save Stock Movement
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add New Product */}
        {showAddProductModal && (
          <div className="modal-overlay" style={{ zIndex: 120 }}>
            <div className="modal-content" style={{ maxWidth: 600, padding: "1.75rem", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1.1rem" }}>Add Trending Product</h4>
                <button className="modal-close-btn" style={{ position: "static" }} onClick={() => setShowAddProductModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">HSN Code *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={newProduct.hsnCode}
                      onChange={(e) => setNewProduct({ ...newProduct, hsnCode: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Rate (%) *</label>
                    <select
                      className="form-control"
                      value={newProduct.gstRate}
                      onChange={(e) => setNewProduct({ ...newProduct, gstRate: Number(e.target.value) })}
                    >
                      <option value={18}>18% (Standard Electronics/Tech)</option>
                      <option value={12}>12% (Apparel/Accessories)</option>
                      <option value={5}>5% (Essential Goods)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={newProduct.shortDescription}
                    onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                  />
                </div>

                <h5 style={{ fontSize: "0.9rem", margin: "1rem 0 0.5rem", color: "#fff" }}>Initial Variant</h5>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">MRP (₹)</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newProduct.mrp}
                      onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                  Publish Product
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
