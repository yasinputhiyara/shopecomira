import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Truck,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Tags,
  Ticket,
  Trash2,
  Pencil,
  Ban,
  UploadCloud,
  Check,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "../services/api.js";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";

export default function AdminDashboardPage({ defaultTab }) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab || "overview"); // overview | orders | products | categories | offers | settings

  // Dashboard Data
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [storeSettings, setStoreSettings] = useState(null);

  // Filters & Searches
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");

  // Sub-Modals
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({ courierName: "Delhivery", trackingNumber: "", trackingUrl: "" });
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [adjustStockProduct, setAdjustStockProduct] = useState(null);
  const [stockForm, setStockForm] = useState({ sku: "", quantityChange: 10, reason: "restock" });
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Add category form
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    sortOrder: 0,
  });

  // Add offer form
  const [newOffer, setNewOffer] = useState({
    code: "",
    title: "",
    type: "coupon",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 499,
    maxDiscountAmount: 200,
  });

  // Add product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    brand: "",
    category: "",
    hsnCode: "8518",
    gstRate: 18,
    shortDescription: "",
    images: [],
    manualImageUrl: "",
    variantSku: "",
    variantOptionValue: "Standard",
    mrp: 2999,
    sellingPrice: 1299,
    stock: 25,
    highlights: [],
  });
  const [newProductFeatureInput, setNewProductFeatureInput] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Edit product form
  const [editProductForm, setEditProductForm] = useState({
    name: "",
    slug: "",
    brand: "",
    category: "",
    hsnCode: "8518",
    gstRate: 18,
    shortDescription: "",
    images: [],
    manualImageUrl: "",
    mrp: 0,
    sellingPrice: 0,
    stock: 0,
    highlights: [],
    status: "active",
  });
  const [editProductFeatureInput, setEditProductFeatureInput] = useState("");
  const [isEditUploadingImages, setIsEditUploadingImages] = useState(false);

  // Keep activeTab in sync with defaultTab prop changes from URL
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Verify authentication
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await api.adminMe();
        if (res?.admin) {
          setAdmin(res.admin);
          loadAllData();
        } else {
          navigate("/admin/login", { replace: true });
        }
      } catch {
        navigate("/admin/login", { replace: true });
      }
    }
    verifyAuth();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, settingsRes, offersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminProducts(),
        api.getCategories(),
        api.getAdminSettings(),
        api.getAdminOffers().catch(() => ({ data: [] })),
      ]);

      setStats(statsRes);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setStoreSettings(settingsRes.data || {});
      setOffers(offersRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.adminLogout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      navigate("/admin/login", { replace: true });
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus}`);
      loadAllData();
    } catch (err) {
      alert(err.message || "Could not update status");
    }
  };

  // Save courier tracking
  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    try {
      await api.updateOrderTracking(trackingModalOrder._id, trackingForm);
      setTrackingModalOrder(null);
      loadAllData();
    } catch (err) {
      alert(err.message || "Failed to update tracking");
    }
  };

  // Direct Image Upload Handler (Multiple Images)
  const handleUploadImages = async (e, isEdit = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    if (isEdit) {
      setIsEditUploadingImages(true);
    } else {
      setIsUploadingImages(true);
    }

    try {
      const res = await api.uploadProductImages(formData);
      const uploaded = res.images || [];

      if (isEdit) {
        setEditProductForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploaded],
        }));
      } else {
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...uploaded],
        }));
      }
    } catch (err) {
      alert(err.message || "Failed to upload image(s). Please try again.");
    } finally {
      if (isEdit) {
        setIsEditUploadingImages(false);
      } else {
        setIsUploadingImages(false);
      }
      e.target.value = ""; // reset file input
    }
  };

  // Add manual image URL (optional)
  const handleAddManualImageUrl = (isEdit = false) => {
    if (isEdit) {
      if (!editProductForm.manualImageUrl.trim()) return;
      setEditProductForm((prev) => ({
        ...prev,
        images: [...prev.images, { url: prev.manualImageUrl.trim(), altText: "Product image" }],
        manualImageUrl: "",
      }));
    } else {
      if (!newProduct.manualImageUrl.trim()) return;
      setNewProduct((prev) => ({
        ...prev,
        images: [...prev.images, { url: prev.manualImageUrl.trim(), altText: "Product image" }],
        manualImageUrl: "",
      }));
    }
  };

  // Remove image
  const handleRemoveImage = (index, isEdit = false) => {
    if (isEdit) {
      setEditProductForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setNewProduct((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  // Set primary image (move to index 0)
  const handleSetPrimaryImage = (index, isEdit = false) => {
    if (index === 0) return;
    if (isEdit) {
      setEditProductForm((prev) => {
        const copy = [...prev.images];
        const [moved] = copy.splice(index, 1);
        return { ...prev, images: [moved, ...copy] };
      });
    } else {
      setNewProduct((prev) => {
        const copy = [...prev.images];
        const [moved] = copy.splice(index, 1);
        return { ...prev, images: [moved, ...copy] };
      });
    }
  };

  // Add optional additional feature
  const handleAddFeature = (isEdit = false) => {
    if (isEdit) {
      const val = editProductFeatureInput.trim();
      if (!val) return;
      setEditProductForm((prev) => ({
        ...prev,
        highlights: [...(prev.highlights || []), val],
      }));
      setEditProductFeatureInput("");
    } else {
      const val = newProductFeatureInput.trim();
      if (!val) return;
      setNewProduct((prev) => ({
        ...prev,
        highlights: [...(prev.highlights || []), val],
      }));
      setNewProductFeatureInput("");
    }
  };

  // Remove optional additional feature
  const handleRemoveFeature = (index, isEdit = false) => {
    if (isEdit) {
      setEditProductForm((prev) => ({
        ...prev,
        highlights: prev.highlights.filter((_, i) => i !== index),
      }));
    } else {
      setNewProduct((prev) => ({
        ...prev,
        highlights: prev.highlights.filter((_, i) => i !== index),
      }));
    }
  };

  // Create product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const finalImages =
        newProduct.images.length > 0
          ? newProduct.images
          : [{ url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80", altText: newProduct.name }];

      await api.createProduct({
        name: newProduct.name,
        slug: newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        brand: newProduct.brand,
        category: newProduct.category || categories[0]?._id,
        hsnCode: newProduct.hsnCode,
        gstRate: Number(newProduct.gstRate),
        shortDescription: newProduct.shortDescription,
        images: finalImages,
        highlights: newProduct.highlights || [],
        variants: [
          {
            sku: newProduct.variantSku || `${(newProduct.brand || "PRD").slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            options: [{ name: "Model", value: newProduct.variantOptionValue || "Standard" }],
            mrpPaise: Math.round(Number(newProduct.mrp) * 100),
            sellingPricePaise: Math.round(Number(newProduct.sellingPrice) * 100),
            stockQuantity: Math.max(0, Number(newProduct.stock)),
          },
        ],
      });

      setShowAddProductModal(false);
      setNewProduct({
        name: "",
        slug: "",
        brand: "",
        category: categories[0]?._id || "",
        hsnCode: "8518",
        gstRate: 18,
        shortDescription: "",
        images: [],
        manualImageUrl: "",
        variantSku: "",
        variantOptionValue: "Standard",
        mrp: 2999,
        sellingPrice: 1299,
        stock: 25,
        highlights: [],
      });
      loadAllData();
      alert("Product published successfully!");
    } catch (err) {
      alert(err.message || "Could not create product");
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (p) => {
    const defVar = p.variants?.[0] || {};
    setEditingProduct(p);
    setEditProductForm({
      name: p.name || "",
      slug: p.slug || "",
      brand: p.brand || "",
      category: p.category?._id || p.category || (categories[0]?._id || ""),
      hsnCode: p.hsnCode || "",
      gstRate: p.gstRate || 18,
      shortDescription: p.shortDescription || "",
      images: p.images && p.images.length > 0 ? [...p.images] : [],
      manualImageUrl: "",
      mrp: (defVar.mrpPaise || 0) / 100,
      sellingPrice: (defVar.sellingPricePaise || 0) / 100,
      stock: defVar.stockQuantity ?? 0,
      highlights: p.highlights && p.highlights.length > 0 ? [...p.highlights] : [],
      status: p.status || "active",
    });
    setEditProductFeatureInput("");
  };

  // Save Edited Product (maintains stock and inventory directly!)
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const existingVariants = editingProduct.variants || [];
      const primaryVariant = existingVariants[0] || {};
      const updatedVariant = {
        ...primaryVariant,
        sku: primaryVariant.sku || `${(editProductForm.brand || "PRD").slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        mrpPaise: Math.round(Number(editProductForm.mrp) * 100),
        sellingPricePaise: Math.round(Number(editProductForm.sellingPrice) * 100),
        stockQuantity: Math.max(0, Number(editProductForm.stock)),
      };

      const finalImages =
        editProductForm.images.length > 0
          ? editProductForm.images
          : editingProduct.images;

      await api.updateProduct(editingProduct._id, {
        name: editProductForm.name,
        slug: editProductForm.slug || editProductForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        brand: editProductForm.brand,
        category: editProductForm.category,
        hsnCode: editProductForm.hsnCode,
        gstRate: Number(editProductForm.gstRate),
        shortDescription: editProductForm.shortDescription,
        images: finalImages,
        highlights: editProductForm.highlights || [],
        status: editProductForm.status || "active",
        variants: [updatedVariant, ...existingVariants.slice(1)],
      });

      setEditingProduct(null);
      loadAllData();
      alert("Product updated successfully! Inventory and details saved.");
    } catch (err) {
      alert(err.message || "Could not update product");
    }
  };

  // Toggle Block / Unblock Product
  const handleToggleBlockProduct = async (productId, currentStatus) => {
    try {
      const action = currentStatus === "blocked" ? "unblock" : "block";
      if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;
      await api.toggleBlockProduct(productId);
      loadAllData();
    } catch (err) {
      alert(err.message || "Failed to update product status");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete product "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      loadAllData();
    } catch (err) {
      alert(err.message || "Could not delete product");
    }
  };

  // Adjust stock (optional standalone helper)
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
      loadAllData();
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
      loadAllData();
    } catch (err) {
      alert(err.message || "Could not save settings");
    }
  };

  // Tab switching synced with router
  const handleSwitchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "overview") {
      navigate("/admin");
    } else {
      navigate(`/admin/${tab}`);
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory({
        name: newCategory.name,
        slug: newCategory.slug || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: newCategory.description,
        imageUrl: newCategory.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
        sortOrder: Number(newCategory.sortOrder) || 0,
      });
      setShowAddCategoryModal(false);
      setNewCategory({ name: "", slug: "", description: "", imageUrl: "", sortOrder: 0 });
      loadAllData();
    } catch (err) {
      alert(err.message || "Failed to create category");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      loadAllData();
    } catch (err) {
      alert(err.message || "Could not delete category");
    }
  };

  // Create Offer / Coupon
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      await api.createOffer({
        code: newOffer.code ? newOffer.code.toUpperCase().trim() : undefined,
        title: newOffer.title,
        type: newOffer.type,
        discountType: newOffer.discountType,
        discountValue: Number(newOffer.discountValue),
        minOrderPaise: Math.round(Number(newOffer.minOrderAmount) * 100),
        maxDiscountPaise: newOffer.maxDiscountAmount ? Math.round(Number(newOffer.maxDiscountAmount) * 100) : undefined,
        isActive: true,
      });
      setShowAddOfferModal(false);
      setNewOffer({
        code: "",
        title: "",
        type: "coupon",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 499,
        maxDiscountAmount: 200,
      });
      loadAllData();
    } catch (err) {
      alert(err.message || "Failed to create offer");
    }
  };

  // Delete Offer
  const handleDeleteOffer = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete offer "${title}"?`)) return;
    try {
      await api.deleteOffer(id);
      loadAllData();
    } catch (err) {
      alert(err.message || "Could not delete offer");
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "all" && o.orderStatus !== orderStatusFilter) return false;
    if (orderPaymentFilter !== "all") {
      const pStatus = o.paymentDetails?.status || "pending";
      if (pStatus !== orderPaymentFilter) return false;
    }
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const matchName = o.customer?.fullName?.toLowerCase().includes(q);
      const matchPhone = o.customer?.phone?.includes(q);
      const matchPayId = o.paymentDetails?.razorpayPaymentId?.toLowerCase().includes(q);
      const matchRzpOrd = o.paymentDetails?.razorpayOrderId?.toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchPayId || matchRzpOrd;
    }
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
        <div style={{ color: "var(--text-muted)" }}>Loading admin operations portal...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
      {/* Top Navbar */}
      <header
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-medium)",
          padding: "0.85rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>
              Shopecomira Admin Portal
            </h2>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Commerce Operations & Fulfilment Hub
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            to="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              padding: "0.45rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span>View Live Storefront</span>
            <ExternalLink size={14} />
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              {admin?.name} ({admin?.role})
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", flex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border-subtle)",
            padding: "1.25rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          <button
            className={`btn-nav-action ${activeTab === "overview" ? "active" : ""}`}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background: activeTab === "overview" ? "var(--bg-surface-elevated)" : "transparent",
              color: activeTab === "overview" ? "#fff" : "var(--text-secondary)",
              fontWeight: 600,
            }}
            onClick={() => handleSwitchTab("overview")}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`btn-nav-action ${activeTab === "orders" ? "active" : ""}`}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background: activeTab === "orders" ? "var(--bg-surface-elevated)" : "transparent",
              color: activeTab === "orders" ? "#fff" : "var(--text-secondary)",
              fontWeight: 600,
            }}
            onClick={() => handleSwitchTab("orders")}
          >
            <ShoppingBag size={18} />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            className={`btn-nav-action ${activeTab === "products" ? "active" : ""}`}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background: activeTab === "products" ? "var(--bg-surface-elevated)" : "transparent",
              color: activeTab === "products" ? "#fff" : "var(--text-secondary)",
              fontWeight: 600,
            }}
            onClick={() => handleSwitchTab("products")}
          >
            <Package size={18} />
            <span>Catalogue ({products.length})</span>
          </button>

          <button
            className={`btn-nav-action ${activeTab === "categories" ? "active" : ""}`}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background: activeTab === "categories" ? "var(--bg-surface-elevated)" : "transparent",
              color: activeTab === "categories" ? "#fff" : "var(--text-secondary)",
              fontWeight: 600,
            }}
            onClick={() => handleSwitchTab("categories")}
          >
            <Tags size={18} />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            className={`btn-nav-action ${activeTab === "offers" ? "active" : ""}`}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background: activeTab === "offers" ? "var(--bg-surface-elevated)" : "transparent",
              color: activeTab === "offers" ? "#fff" : "var(--text-secondary)",
              fontWeight: 600,
            }}
            onClick={() => handleSwitchTab("offers")}
          >
            <Ticket size={18} />
            <span>Offers & Coupons ({offers.length})</span>
          </button>

          <button
            className={`btn-nav-action ${activeTab === "settings" ? "active" : ""}`}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background: activeTab === "settings" ? "var(--bg-surface-elevated)" : "transparent",
              color: activeTab === "settings" ? "#fff" : "var(--text-secondary)",
              fontWeight: 600,
            }}
            onClick={() => handleSwitchTab("settings")}
          >
            <Settings size={18} />
            <span>Store & GST</span>
          </button>
        </aside>

        {/* Content Body */}
        <main style={{ padding: "2rem", overflowY: "auto" }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>
                Executive Performance & Operations KPIs
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Gross Confirmed Revenue</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginTop: "0.3rem" }}>
                    ₹{(((stats?.totalRevenuePaise || 0) / 100)).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", marginTop: "0.35rem" }}>
                    From server-verified orders
                  </div>
                </div>

                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Order Volume</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginTop: "0.3rem" }}>
                    {stats?.totalOrders || 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                    {stats?.prepaidCount || 0} Prepaid &bull; {stats?.codCount || 0} Cash on Delivery
                  </div>
                </div>

                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Prepaid Conversion Share</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: (stats?.prepaidPercentage || 0) >= 60 ? "var(--accent-emerald)" : "var(--accent-amber)", marginTop: "0.3rem" }}>
                    {stats?.prepaidPercentage || 0}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                    PRD Target: &ge; 60%
                  </div>
                </div>

                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Online Payments (Razorpay)</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "0.3rem" }}>
                    {stats?.paidCount || 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: (stats?.failedPaymentCount || 0) > 0 ? "var(--accent-rose)" : "var(--text-secondary)", marginTop: "0.35rem" }}>
                    {stats?.failedPaymentCount || 0} Failed &bull; {stats?.pendingPaymentCount || 0} Pending
                  </div>
                </div>

                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Low Stock Inventory Warnings</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: (stats?.lowStockCount || 0) > 0 ? "var(--accent-rose)" : "var(--accent-emerald)", marginTop: "0.3rem" }}>
                    {stats?.lowStockCount || 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                    Variants with &le; 5 units
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Recent Customer Orders</h4>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                      <th style={{ padding: "0.85rem 1rem" }}>Order Reference</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Customer</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Payment Mode</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Gross Total</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Status</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Tax Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 6).map((ord) => (
                      <tr key={ord._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--accent-indigo)" }}>
                          {ord.orderNumber}
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div>{ord.customer?.fullName}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>+91 {ord.customer?.phone}</div>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ textTransform: "uppercase", fontWeight: 600, fontSize: "0.8rem" }}>
                            {ord.paymentMethod === "prepaid" ? "Razorpay" : "COD"}
                          </span>
                          <span style={{
                            marginLeft: "0.4rem",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            background: ord.paymentDetails?.status === "paid" ? "rgba(16,185,129,0.15)" : ord.paymentDetails?.status === "failed" ? "rgba(244,63,94,0.15)" : "rgba(245,158,11,0.15)",
                            color: ord.paymentDetails?.status === "paid" ? "var(--accent-emerald)" : ord.paymentDetails?.status === "failed" ? "var(--accent-rose)" : "var(--accent-amber)",
                          }}>
                            {ord.paymentDetails?.status?.toUpperCase() || "PENDING"}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>
                          ₹{((ord.pricing?.totalPaise || 0) / 100).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600, background: "var(--bg-surface-elevated)" }}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
                            onClick={() => setViewingInvoice(ord)}
                          >
                            GST Invoice
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h3 style={{ fontSize: "1.3rem" }}>Customer Orders & Logistics Fulfilment</h3>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Search Order #, phone, name..."
                    className="form-control"
                    style={{ width: 260, height: 38, fontSize: "0.85rem" }}
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                  <select
                    className="form-control"
                    style={{ width: 150, height: 38, fontSize: "0.85rem" }}
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    className="form-control"
                    style={{ width: 165, height: 38, fontSize: "0.85rem" }}
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">✓ Paid</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="failed">✕ Failed</option>
                  </select>
                </div>
              </div>

              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                      <th style={{ padding: "0.85rem 1rem" }}>Order / Buyer</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Items Snapshot</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Payment</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Total Amount</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Status Transition</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Courier Tracking</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                          No orders found matching the filter
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <strong style={{ color: "var(--accent-indigo)" }}>{ord.orderNumber}</strong>
                            <div style={{ fontWeight: 600, color: "#fff", marginTop: "0.2rem" }}>
                              {ord.customer?.fullName}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              +91 {ord.customer?.phone}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                              {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                            </div>
                          </td>

                          <td style={{ padding: "0.85rem 1rem" }}>
                            {ord.items?.map((it, idx) => (
                              <div key={idx} style={{ fontSize: "0.8rem", marginBottom: "0.2rem" }}>
                                {it.productName} ({it.variantSku}) &times; <strong>{it.quantity}</strong>
                              </div>
                            ))}
                          </td>

                          <td style={{ padding: "0.85rem 1rem" }}>
                            <div style={{ textTransform: "uppercase", fontWeight: 700, fontSize: "0.82rem" }}>
                              {ord.paymentMethod === "prepaid" ? "Razorpay" : "COD"}
                            </div>
                            <div style={{ marginTop: "0.25rem" }}>
                              {ord.paymentDetails?.status === "paid" ? (
                                <span style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "4px",
                                  background: "rgba(16, 185, 129, 0.15)",
                                  color: "var(--accent-emerald)",
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                }}>
                                  ✓ PAID
                                </span>
                              ) : ord.paymentDetails?.status === "failed" ? (
                                <span style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "4px",
                                  background: "rgba(244, 63, 94, 0.15)",
                                  color: "var(--accent-rose)",
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                }} title={ord.paymentDetails?.failureReason || "Payment Failed"}>
                                  ✕ FAILED
                                </span>
                              ) : (
                                <span style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "4px",
                                  background: "rgba(245, 158, 11, 0.15)",
                                  color: "var(--accent-amber)",
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                }}>
                                  ⏳ PENDING
                                </span>
                              )}
                            </div>
                            {ord.paymentDetails?.razorpayPaymentId && (
                              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.25rem", fontFamily: "monospace" }}>
                                {ord.paymentDetails.razorpayPaymentId}
                              </div>
                            )}
                            {ord.paymentDetails?.status === "failed" && ord.paymentDetails?.failureReason && (
                              <div style={{ fontSize: "0.68rem", color: "var(--accent-rose)", marginTop: "0.25rem", maxWidth: 160 }} title={ord.paymentDetails.failureReason}>
                                {ord.paymentDetails.failureReason.length > 28 ? ord.paymentDetails.failureReason.slice(0, 28) + "..." : ord.paymentDetails.failureReason}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>
                            ₹{((ord.pricing?.totalPaise || 0) / 100).toLocaleString("en-IN")}
                          </td>

                          <td style={{ padding: "0.85rem 1rem" }}>
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                              className="form-control"
                              style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem", height: 34 }}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td style={{ padding: "0.85rem 1rem" }}>
                            {ord.tracking?.trackingNumber ? (
                              <div>
                                <strong>{ord.tracking.courierName}</strong>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
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
                                  style={{ color: "var(--accent-indigo)", fontSize: "0.75rem", textDecoration: "underline" }}
                                >
                                  Edit Tracking
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn-secondary"
                                style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                                onClick={() => {
                                  setTrackingModalOrder(ord);
                                  setTrackingForm({ courierName: "BlueDart", trackingNumber: "", trackingUrl: "" });
                                }}
                              >
                                <Truck size={14} />
                                <span>Add Tracking</span>
                              </button>
                            )}
                          </td>

                          <td style={{ padding: "0.85rem 1rem" }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                              onClick={() => setViewingInvoice(ord)}
                            >
                              <FileText size={14} />
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem" }}>Catalogue & Product Inventory</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Manage product pricing, direct inventory stock, multiple images, and block/unblock visibility.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setShowAddProductModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Plus size={18} />
                  <span>Add Trending Product</span>
                </button>
              </div>

              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                      <th style={{ padding: "0.85rem 1rem" }}>Product Details</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Category</th>
                      <th style={{ padding: "0.85rem 1rem" }}>HSN & GST Rate</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Selling / MRP</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Inventory Stock</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Status</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                          No products found in catalogue. Click "Add Trending Product" to publish one.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const defVar = p.variants?.[0] || {};
                        const totalStock = p.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;
                        const isBlocked = p.status === "blocked";
                        const imageCount = p.images?.length || 0;

                        return (
                          <tr
                            key={p._id}
                            style={{
                              borderBottom: "1px solid var(--border-subtle)",
                              background: isBlocked ? "rgba(244, 63, 94, 0.03)" : "transparent",
                            }}
                          >
                            <td style={{ padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <div style={{ position: "relative" }}>
                                <img
                                  src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=120&q=80"}
                                  alt=""
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                    border: "1px solid var(--border-subtle)",
                                    opacity: isBlocked ? 0.6 : 1,
                                  }}
                                />
                                {imageCount > 1 && (
                                  <span
                                    style={{
                                      position: "absolute",
                                      bottom: "-4px",
                                      right: "-4px",
                                      background: "var(--bg-main)",
                                      border: "1px solid var(--border-subtle)",
                                      borderRadius: "6px",
                                      padding: "1px 4px",
                                      fontSize: "0.65rem",
                                      fontWeight: 700,
                                      color: "var(--text-secondary)",
                                    }}
                                    title={`${imageCount} images`}
                                  >
                                    📷 {imageCount}
                                  </span>
                                )}
                              </div>
                              <div>
                                <strong style={{ color: isBlocked ? "var(--text-secondary)" : "#fff", display: "block" }}>
                                  {p.name}
                                </strong>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                                  Brand: <strong>{p.brand || "N/A"}</strong> &bull; SKU: {defVar.sku || "N/A"}
                                </div>
                                {p.highlights?.length > 0 && (
                                  <div style={{ fontSize: "0.72rem", color: "var(--accent-indigo)", marginTop: "0.15rem" }}>
                                    ★ {p.highlights.length} feature(s)
                                  </div>
                                )}
                              </div>
                            </td>

                            <td style={{ padding: "0.85rem 1rem" }}>{p.category?.name || "General"}</td>

                            <td style={{ padding: "0.85rem 1rem" }}>
                              <div>HSN: <strong>{p.hsnCode}</strong></div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>GST: {p.gstRate}%</div>
                            </td>

                            <td style={{ padding: "0.85rem 1rem" }}>
                              <div style={{ fontWeight: 700, color: "#fff" }}>
                                ₹{(((defVar.sellingPricePaise || 0) / 100)).toLocaleString("en-IN")}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                ₹{(((defVar.mrpPaise || 0) / 100)).toLocaleString("en-IN")}
                              </div>
                            </td>

                            <td style={{ padding: "0.85rem 1rem" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  fontWeight: 700,
                                  color: totalStock === 0 ? "var(--accent-rose)" : totalStock <= 5 ? "var(--accent-amber)" : "var(--accent-emerald)",
                                }}
                              >
                                {totalStock === 0 ? (
                                  <span>Out of Stock</span>
                                ) : (
                                  <span>{totalStock} units</span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                (edit below to adjust)
                              </div>
                            </td>

                            <td style={{ padding: "0.85rem 1rem" }}>
                              {isBlocked ? (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    padding: "0.25rem 0.6rem",
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    background: "rgba(244, 63, 94, 0.15)",
                                    color: "var(--accent-rose)",
                                    border: "1px solid rgba(244, 63, 94, 0.3)",
                                  }}
                                >
                                  <Ban size={12} />
                                  Blocked
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    padding: "0.25rem 0.6rem",
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    background: "rgba(16, 185, 129, 0.15)",
                                    color: "var(--accent-emerald)",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                  }}
                                >
                                  <Check size={12} />
                                  Active
                                </span>
                              )}
                            </td>

                            <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                                {/* Edit Product Button */}
                                <button
                                  className="btn-secondary"
                                  style={{
                                    padding: "0.4rem 0.75rem",
                                    fontSize: "0.78rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                    fontWeight: 600,
                                  }}
                                  onClick={() => handleOpenEditProduct(p)}
                                  title="Edit details, stock, pricing & images"
                                >
                                  <Pencil size={13} />
                                  <span>Edit</span>
                                </button>

                                {/* Block or Unblock Button */}
                                <button
                                  className="btn-secondary"
                                  style={{
                                    padding: "0.4rem 0.75rem",
                                    fontSize: "0.78rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                    fontWeight: 600,
                                    borderColor: isBlocked ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)",
                                    color: isBlocked ? "var(--accent-emerald)" : "var(--accent-rose)",
                                    background: isBlocked ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)",
                                  }}
                                  onClick={() => handleToggleBlockProduct(p._id, p.status)}
                                  title={isBlocked ? "Unblock this product to show on storefront" : "Block this product from customer storefront"}
                                >
                                  {isBlocked ? (
                                    <>
                                      <CheckCircle2 size={13} />
                                      <span>Unblock</span>
                                    </>
                                  ) : (
                                    <>
                                      <Ban size={13} />
                                      <span>Block</span>
                                    </>
                                  )}
                                </button>

                                {/* Delete Button */}
                                <button
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    padding: "0.35rem",
                                    borderRadius: "4px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}
                                  onClick={() => handleDeleteProduct(p._id, p.name)}
                                  title="Delete product"
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-rose)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: STORE & GST SETTINGS */}
          {activeTab === "settings" && storeSettings && (
            <div style={{ maxWidth: 740 }}>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>
                Store Configuration & GST Details
              </h3>

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
                  <label className="form-label">Legal Entity Name (Printed on Tax Invoices)</label>
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
                    <label className="form-label">Customer Support WhatsApp Number (International format)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="919876543210"
                      value={storeSettings.whatsappNumber || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prepaid Online Discount (%)</label>
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
                    <label className="form-label">Free Shipping Minimum Order (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={(storeSettings.freeShippingThresholdPaise || 99900) / 100}
                      onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThresholdPaise: Number(e.target.value) * 100 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cash on Delivery Handling Fee (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={(storeSettings.codFeePaise || 5000) / 100}
                      onChange={(e) => setStoreSettings({ ...storeSettings, codFeePaise: Number(e.target.value) * 100 })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>
                  Save All Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: CATEGORIES */}
          {activeTab === "categories" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem" }}>Product Categories</h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Manage store collections and storefront taxonomy
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setShowAddCategoryModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Plus size={18} />
                  <span>Add Category</span>
                </button>
              </div>

              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                      <th style={{ padding: "0.85rem 1rem" }}>Category</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Slug / URL</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Sort Order</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Status</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                          No categories defined yet.
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <img
                              src={cat.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80"}
                              alt=""
                              style={{ width: 40, height: 40, borderRadius: "6px", objectFit: "cover" }}
                            />
                            <div>
                              <strong style={{ color: "#fff" }}>{cat.name}</strong>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {cat.description || "No description provided"}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>
                            <code style={{ background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                              /category/{cat.slug}
                            </code>
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>{cat.sortOrder ?? 0}</td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", background: cat.isActive !== false ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: cat.isActive !== false ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                              {cat.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem", color: "var(--accent-rose)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                              onClick={() => handleDeleteCategory(cat._id, cat.name)}
                              title="Delete category"
                            >
                              <Trash2 size={14} />
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

          {/* TAB 6: OFFERS & COUPONS */}
          {activeTab === "offers" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem" }}>Offers, Coupons & Promotions</h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Configure automatic discounts and coupon codes
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setShowAddOfferModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Plus size={18} />
                  <span>Create Offer / Coupon</span>
                </button>
              </div>

              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-surface-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                      <th style={{ padding: "0.85rem 1rem" }}>Offer Title</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Coupon Code</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Discount</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Min Order</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Type / Scope</th>
                      <th style={{ padding: "0.85rem 1rem" }}>Status</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                          No active offers or coupons found.
                        </td>
                      </tr>
                    ) : (
                      offers.map((off) => (
                        <tr key={off._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <strong style={{ color: "#fff" }}>{off.title}</strong>
                            {off.description && (
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {off.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            {off.code ? (
                              <code style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--accent-indigo)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                                {off.code}
                              </code>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Auto-Applied</span>
                            )}
                          </td>
                          <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "var(--accent-emerald)" }}>
                            {off.discountType === "percentage" ? `${off.discountValue}% OFF` : `₹${off.discountValue} OFF`}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            ₹{((off.minOrderPaise || 0) / 100).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span style={{ textTransform: "capitalize", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              {off.type || "coupon"}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", background: off.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: off.isActive ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                              {off.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem", color: "var(--accent-rose)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                              onClick={() => handleDeleteOffer(off._id, off.title)}
                              title="Delete offer"
                            >
                              <Trash2 size={14} />
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
        </main>
      </div>

      {/* Sub-modal: Courier Tracking */}
      {trackingModalOrder && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-content" style={{ maxWidth: 460, padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1.1rem" }}>Logistics Tracking: {trackingModalOrder.orderNumber}</h4>
              <button className="modal-close-btn" style={{ position: "static" }} onClick={() => setTrackingModalOrder(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTracking}>
              <div className="form-group">
                <label className="form-label">Courier Service</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={trackingForm.courierName}
                  onChange={(e) => setTrackingForm({ ...trackingForm, courierName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tracking Number (AWB)</label>
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
                Update Tracking & Mark Shipped
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub-modal: Adjust Stock */}
      {adjustStockProduct && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-content" style={{ maxWidth: 460, padding: "1.75rem" }}>
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
                      {v.sku} - Current Stock: {v.stockQuantity}
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

      {/* Sub-modal: Add New Product */}
      {showAddProductModal && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-content" style={{ maxWidth: 680, padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem" }}>
              <div>
                <h4 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>Publish New Trending Product</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  Add product specifications, direct image uploads, pricing, and initial stock.
                </p>
              </div>
              <button className="modal-close-btn" style={{ position: "static" }} onClick={() => setShowAddProductModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              {/* Product Basic Info */}
              <div className="form-group">
                <label className="form-label">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Active Noise Cancelling Wireless Headphones"
                  className="form-control"
                  value={newProduct.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setNewProduct({ ...newProduct, name, slug });
                  }}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. SonicPulse"
                    className="form-control"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
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
                    placeholder="e.g. 8518"
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
                    <option value={28}>28% (Luxury)</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
              </div>

              {/* Direct Image Upload & Multiple Images */}
              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ImageIcon size={16} color="var(--accent-indigo)" />
                    Product Images (Uploaded to Cloudinary CDN)
                  </label>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {newProduct.images.length} image(s) attached
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Upload image files directly to your Cloudinary cloud (JPG, PNG, WEBP, GIF). Select multiple images at once.
                </p>

                {/* File Upload Zone */}
                <div
                  style={{
                    border: "2px dashed var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem",
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.02)",
                    marginBottom: "1rem",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isUploadingImages}
                    onChange={(e) => handleUploadImages(e, false)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <UploadCloud size={32} style={{ color: "var(--accent-indigo)", margin: "0 auto 0.5rem" }} />
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>
                    {isUploadingImages ? "Uploading images to Cloudinary..." : "Click or Drag to Upload Image Files to Cloudinary"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Fast CDN delivery, automated optimization & secure cloud storage.
                  </div>
                </div>

                {/* Uploaded Thumbnails Preview Strip */}
                {newProduct.images.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                      Uploaded Product Gallery (First image is the Primary storefront thumbnail):
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      {newProduct.images.map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            width: 90,
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            border: `2px solid ${idx === 0 ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
                            background: "var(--bg-surface)",
                          }}
                        >
                          <img
                            src={img.url}
                            alt=""
                            style={{ width: "100%", height: 75, objectFit: "cover", display: "block" }}
                          />
                          {idx === 0 && (
                            <span
                              style={{
                                position: "absolute",
                                top: 2,
                                left: 2,
                                background: "var(--accent-indigo)",
                                color: "#fff",
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                padding: "1px 4px",
                                borderRadius: "3px",
                              }}
                            >
                              Primary
                            </span>
                          )}
                          <div style={{ display: "flex", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface-elevated)" }}>
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx, false)}
                                style={{
                                  flex: 1,
                                  background: "none",
                                  border: "none",
                                  color: "var(--accent-indigo)",
                                  fontSize: "0.65rem",
                                  padding: "3px 0",
                                  cursor: "pointer",
                                }}
                                title="Set as Primary Cover"
                              >
                                Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx, false)}
                              style={{
                                flex: 1,
                                background: "none",
                                border: "none",
                                color: "var(--accent-rose)",
                                fontSize: "0.65rem",
                                padding: "3px 0",
                                cursor: "pointer",
                              }}
                              title="Delete Image"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional manual URL input */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <input
                    type="url"
                    placeholder="Or paste an external Image URL (optional)..."
                    className="form-control"
                    style={{ fontSize: "0.8rem", height: 34 }}
                    value={newProduct.manualImageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, manualImageUrl: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "0 0.75rem", flexShrink: 0 }}
                    onClick={() => handleAddManualImageUrl(false)}
                  >
                    + Add URL
                  </button>
                </div>
              </div>

              {/* Short Description */}
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Key summary displayed to customers..."
                  className="form-control"
                  value={newProduct.shortDescription}
                  onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                />
              </div>

              {/* Pricing & Direct Stock Management */}
              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.25rem" }}>
                <h5 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem" }}>
                  Pricing & Inventory Stock (Maintained Directly Here)
                </h5>
                <div className="form-row-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newProduct.mrp}
                      onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Initial Stock (Units) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Optional Additional Features / Specifications */}
              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Sparkles size={16} color="var(--accent-amber)" />
                    Additional Features & Highlights (Optional)
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-emerald)" }}>Optional</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Add extra feature descriptions, warranty details, or key selling points to showcase on the product page.
                </p>

                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="e.g. 40-Hour Battery Life with Type-C Quick Charge"
                    className="form-control"
                    style={{ fontSize: "0.82rem" }}
                    value={newProductFeatureInput}
                    onChange={(e) => setNewProductFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "0 1rem", fontSize: "0.8rem", flexShrink: 0 }}
                    onClick={() => handleAddFeature(false)}
                  >
                    + Add Feature
                  </button>
                </div>

                {/* Quick suggestions */}
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", alignSelf: "center" }}>Quick add:</span>
                  {[
                    "1-Year Brand Warranty",
                    "Fast Express Delivery",
                    "IPX4 Water & Sweat Resistant",
                    "Cash on Delivery Eligible",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (!newProduct.highlights.includes(preset)) {
                          setNewProduct((prev) => ({
                            ...prev,
                            highlights: [...prev.highlights, preset],
                          }));
                        }
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "12px",
                        padding: "2px 8px",
                        fontSize: "0.72rem",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Features list */}
                {newProduct.highlights && newProduct.highlights.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {newProduct.highlights.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.35rem 0.65rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)" }}>
                          <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                          {feat}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx, false)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "2px",
                          }}
                          title="Remove feature"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}>
                Publish Product to Store
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub-modal: Edit Product (Maintain Stock, Images, Additional Features, Block/Unblock) */}
      {editingProduct && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-content" style={{ maxWidth: 680, padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem" }}>
              <div>
                <h4 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>Edit Product: {editingProduct.name}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  Maintain stock inventory, update pricing, add/remove multiple images, and set visibility status.
                </p>
              </div>
              <button className="modal-close-btn" style={{ position: "static" }} onClick={() => setEditingProduct(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct}>
              {/* Product Status & Visibility */}
              <div className="form-group" style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                <label className="form-label" style={{ fontWeight: 700, color: "#fff" }}>
                  Product Storefront Status
                </label>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.88rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="editStatus"
                      value="active"
                      checked={editProductForm.status === "active"}
                      onChange={() => setEditProductForm({ ...editProductForm, status: "active" })}
                    />
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>Active (Visible to customers)</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.88rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="editStatus"
                      value="blocked"
                      checked={editProductForm.status === "blocked"}
                      onChange={() => setEditProductForm({ ...editProductForm, status: "blocked" })}
                    />
                    <span style={{ color: "var(--accent-rose)", fontWeight: 600 }}>Blocked (Hidden from Store)</span>
                  </label>
                </div>
              </div>

              {/* Product Basic Info */}
              <div className="form-group">
                <label className="form-label">Product Title *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProductForm.brand}
                    onChange={(e) => setEditProductForm({ ...editProductForm, brand: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={editProductForm.category}
                    onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })}
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
                    value={editProductForm.hsnCode}
                    onChange={(e) => setEditProductForm({ ...editProductForm, hsnCode: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Rate (%) *</label>
                  <select
                    className="form-control"
                    value={editProductForm.gstRate}
                    onChange={(e) => setEditProductForm({ ...editProductForm, gstRate: Number(e.target.value) })}
                  >
                    <option value={18}>18% (Standard Electronics/Tech)</option>
                    <option value={12}>12% (Apparel/Accessories)</option>
                    <option value={5}>5% (Essential Goods)</option>
                    <option value={28}>28% (Luxury)</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
              </div>

              {/* Direct Stock & Inventory Maintenance */}
              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.25rem" }}>
                <h5 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "0.3rem" }}>
                  Pricing & Inventory Stock (Maintain Stock Directly)
                </h5>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Update stock quantities directly here. Changes take effect across the storefront instantly.
                </p>
                <div className="form-row-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={editProductForm.mrp}
                      onChange={(e) => setEditProductForm({ ...editProductForm, mrp: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={editProductForm.sellingPrice}
                      onChange={(e) => setEditProductForm({ ...editProductForm, sellingPrice: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: "var(--accent-indigo)", fontWeight: 700 }}>
                      Current Stock (Units) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="form-control"
                      style={{ borderColor: "var(--accent-indigo)", fontWeight: 700 }}
                      value={editProductForm.stock}
                      onChange={(e) => setEditProductForm({ ...editProductForm, stock: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Direct Image Upload & Multiple Images */}
              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ImageIcon size={16} color="var(--accent-indigo)" />
                    Manage Product Images ({editProductForm.images.length} attached)
                  </label>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Upload image files directly to Cloudinary. Add multiple angles or product views.
                </p>

                {/* File Upload Zone */}
                <div
                  style={{
                    border: "2px dashed var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.02)",
                    marginBottom: "1rem",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isEditUploadingImages}
                    onChange={(e) => handleUploadImages(e, true)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <UploadCloud size={28} style={{ color: "var(--accent-indigo)", margin: "0 auto 0.4rem" }} />
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>
                    {isEditUploadingImages ? "Uploading new image(s) to Cloudinary..." : "Browse & Upload More Images to Cloudinary"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Select multiple image files from your PC (JPG, PNG, WEBP, GIF).
                  </div>
                </div>

                {/* Uploaded Thumbnails Preview Strip */}
                {editProductForm.images.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                      Current Gallery (First image is Cover thumbnail):
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      {editProductForm.images.map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            width: 90,
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            border: `2px solid ${idx === 0 ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
                            background: "var(--bg-surface)",
                          }}
                        >
                          <img
                            src={img.url}
                            alt=""
                            style={{ width: "100%", height: 75, objectFit: "cover", display: "block" }}
                          />
                          {idx === 0 && (
                            <span
                              style={{
                                position: "absolute",
                                top: 2,
                                left: 2,
                                background: "var(--accent-indigo)",
                                color: "#fff",
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                padding: "1px 4px",
                                borderRadius: "3px",
                              }}
                            >
                              Cover
                            </span>
                          )}
                          <div style={{ display: "flex", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface-elevated)" }}>
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx, true)}
                                style={{
                                  flex: 1,
                                  background: "none",
                                  border: "none",
                                  color: "var(--accent-indigo)",
                                  fontSize: "0.65rem",
                                  padding: "3px 0",
                                  cursor: "pointer",
                                }}
                                title="Set as Primary Cover"
                              >
                                Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx, true)}
                              style={{
                                flex: 1,
                                background: "none",
                                border: "none",
                                color: "var(--accent-rose)",
                                fontSize: "0.65rem",
                                padding: "3px 0",
                                cursor: "pointer",
                              }}
                              title="Delete Image"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional manual URL input */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <input
                    type="url"
                    placeholder="Or paste an Image URL (optional)..."
                    className="form-control"
                    style={{ fontSize: "0.8rem", height: 34 }}
                    value={editProductForm.manualImageUrl}
                    onChange={(e) => setEditProductForm({ ...editProductForm, manualImageUrl: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "0 0.75rem", flexShrink: 0 }}
                    onClick={() => handleAddManualImageUrl(true)}
                  >
                    + Add URL
                  </button>
                </div>
              </div>

              {/* Short Description */}
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  rows={2}
                  className="form-control"
                  value={editProductForm.shortDescription}
                  onChange={(e) => setEditProductForm({ ...editProductForm, shortDescription: e.target.value })}
                />
              </div>

              {/* Optional Additional Features / Specifications */}
              <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Sparkles size={16} color="var(--accent-amber)" />
                    Additional Features & Highlights (Optional)
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-emerald)" }}>Optional</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Edit or add specific bullet points for this product.
                </p>

                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="Add a new feature bullet point..."
                    className="form-control"
                    style={{ fontSize: "0.82rem" }}
                    value={editProductFeatureInput}
                    onChange={(e) => setEditProductFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature(true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "0 1rem", fontSize: "0.8rem", flexShrink: 0 }}
                    onClick={() => handleAddFeature(true)}
                  >
                    + Add Feature
                  </button>
                </div>

                {/* Features list */}
                {editProductForm.highlights && editProductForm.highlights.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {editProductForm.highlights.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.35rem 0.65rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)" }}>
                          <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                          {feat}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx, true)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "2px",
                          }}
                          title="Remove feature"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: "0.75rem" }}
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, padding: "0.75rem", fontSize: "0.95rem" }}
                >
                  Save Product Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-modal: Add Category */}
      {showAddCategoryModal && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-content" style={{ maxWidth: 480, padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1.1rem" }}>Create New Category</h4>
              <button className="modal-close-btn" style={{ position: "static" }} onClick={() => setShowAddCategoryModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Audio"
                  className="form-control"
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setNewCategory({ ...newCategory, name, slug });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="smart-audio"
                  className="form-control"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="form-control"
                  value={newCategory.imageUrl}
                  onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the collection..."
                  className="form-control"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sort Priority</label>
                <input
                  type="number"
                  className="form-control"
                  value={newCategory.sortOrder}
                  onChange={(e) => setNewCategory({ ...newCategory, sortOrder: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub-modal: Add Offer / Coupon */}
      {showAddOfferModal && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-content" style={{ maxWidth: 480, padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1.1rem" }}>Create Promo / Coupon Code</h4>
              <button className="modal-close-btn" style={{ position: "static" }} onClick={() => setShowAddOfferModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateOffer}>
              <div className="form-group">
                <label className="form-label">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Special 15% OFF"
                  className="form-control"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Coupon Code (Leave empty if automatic)</label>
                <input
                  type="text"
                  placeholder="FESTIVE15"
                  className="form-control"
                  style={{ textTransform: "uppercase" }}
                  value={newOffer.code}
                  onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select
                    className="form-control"
                    value={newOffer.discountType}
                    onChange={(e) => setNewOffer({ ...newOffer, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="form-control"
                    value={newOffer.discountValue}
                    onChange={(e) => setNewOffer({ ...newOffer, discountValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Minimum Order (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newOffer.minOrderAmount}
                    onChange={(e) => setNewOffer({ ...newOffer, minOrderAmount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newOffer.maxDiscountAmount}
                    onChange={(e) => setNewOffer({ ...newOffer, maxDiscountAmount: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Create Offer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {viewingInvoice && (
        <GstInvoiceModal
          invoiceData={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
}
