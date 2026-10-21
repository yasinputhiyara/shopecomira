import React from "react";
import { Sparkles, Flame, Award, Tag, Layers } from "lucide-react";

export default function CategoryStrip({
  categories = [],
  activeFilter,
  onSelectFilter,
}) {
  return (
    <nav className="category-strip" aria-label="Product categories">
      <div className="container">
        <div className="category-strip-inner">
          <button
            className={`category-pill ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => onSelectFilter("all")}
          >
            <Layers size={14} />
            <span>All Products</span>
          </button>

          <button
            className={`category-pill ${activeFilter === "trending" ? "active" : ""}`}
            onClick={() => onSelectFilter("trending")}
          >
            <Flame size={14} />
            <span>Trending Deals</span>
          </button>

          <button
            className={`category-pill ${activeFilter === "bestseller" ? "active" : ""}`}
            onClick={() => onSelectFilter("bestseller")}
          >
            <Award size={14} />
            <span>Best Sellers</span>
          </button>

          <button
            className={`category-pill ${activeFilter === "new" ? "active" : ""}`}
            onClick={() => onSelectFilter("new")}
          >
            <Sparkles size={14} />
            <span>New Arrivals</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`category-pill ${activeFilter === cat.slug ? "active" : ""}`}
              onClick={() => onSelectFilter(cat.slug)}
            >
              <Tag size={14} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
