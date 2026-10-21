import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Flame, Sparkles, ShoppingBag, Eye } from "lucide-react";

export default function ProductCard({
  product,
  onSelectProduct,
  onAddToCart,
}) {
  const navigate = useNavigate();
  const defaultVariant = product.variants?.[0] || {};
  const sellingPrice = (defaultVariant.sellingPricePaise || 0) / 100;
  const mrp = (defaultVariant.mrpPaise || 0) / 100;

  const discountPercent =
    mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  // Prepaid price with 5% off
  const prepaidPrice = Math.round(sellingPrice * 0.95);

  const mainImage =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80";

  const handleProductClick = () => {
    if (product.slug) {
      navigate(`/product/${product.slug}`);
    } else if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants && product.variants.length > 1) {
      handleProductClick();
    } else {
      if (onAddToCart) onAddToCart(product, defaultVariant, 1);
    }
  };

  return (
    <article className="product-card" id={`product-${product.slug}`}>
      <div
        className="product-thumb-container"
        onClick={handleProductClick}
        style={{ cursor: "pointer" }}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {/* Flag Badges */}
        {product.isTrending && (
          <span className="badge-flag">
            <Flame size={12} color="#f59e0b" />
            Trending
          </span>
        )}
        {!product.isTrending && product.isBestSeller && (
          <span className="badge-flag">
            <Sparkles size={12} color="#10b981" />
            Best Seller
          </span>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="badge-discount">-{discountPercent}%</span>
        )}

        {/* Quick View on Hover */}
        {product.slug && (
          <Link
            to={`/product/${product.slug}`}
            className="quick-view-btn"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: "0.75rem",
              right: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.35rem 0.65rem",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.72rem",
              fontWeight: 600,
              textDecoration: "none",
              backdropFilter: "blur(4px)",
              opacity: 0,
              transition: "opacity 0.2s ease",
            }}
            title="View full product page"
          >
            <Eye size={12} />
            Full Page
          </Link>
        )}
      </div>

      <div className="product-info">
        <div className="product-meta">
          <span className="product-brand">{product.brand || "Trending"}</span>
          <div className="product-rating">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{product.rating || 4.8}</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
              ({product.reviewCount || 35})
            </span>
          </div>
        </div>

        <h3
          className="product-title"
          onClick={handleProductClick}
          title={product.name}
          style={{ cursor: "pointer" }}
        >
          {product.name}
        </h3>

        <div className="product-pricing">
          <div className="price-row">
            <span className="price-current">₹{sellingPrice.toLocaleString("en-IN")}</span>
            {mrp > sellingPrice && (
              <span className="price-mrp">₹{mrp.toLocaleString("en-IN")}</span>
            )}
          </div>
          <div className="prepaid-tag">
            <span>Prepaid: <strong>₹{prepaidPrice.toLocaleString("en-IN")}</strong></span>
          </div>
        </div>

        <button
          className="btn-card-add"
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag size={16} />
          <span>{product.variants?.length > 1 ? "Select Options" : "Add to Cart"}</span>
        </button>
      </div>
    </article>
  );
}
