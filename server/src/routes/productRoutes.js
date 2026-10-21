import { Router } from "express";
import multer from "multer";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import InventoryMovement from "../models/InventoryMovement.js";
import { requireAdmin, requireRole } from "../middleware/authMiddleware.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
});

const router = Router();

// Public: Get products with filters, search, and sorting
router.get("/", async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 12, 1),
      48
    );

    const filter = { status: "active" };

    // Category filter by slug or ID
    if (req.query.category) {
      const cat = await Category.findOne({
        $or: [{ slug: req.query.category }, { _id: req.query.category.match(/^[0-9a-fA-F]{24}$/) ? req.query.category : null }],
      }).lean();
      if (cat) {
        filter.category = cat._id;
      }
    }

    // Flag filters
    if (req.query.trending === "true") {
      filter.isTrending = true;
    }
    if (req.query.bestSeller === "true") {
      filter.isBestSeller = true;
    }
    if (req.query.newArrival === "true") {
      filter.isNewArrival = true;
    }

    // Text search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { shortDescription: searchRegex },
        { "variants.sku": searchRegex },
      ];
    }

    // Sort order
    let sort = { createdAt: -1 };
    if (req.query.sort === "price_asc") {
      sort = { "variants.0.sellingPricePaise": 1 };
    } else if (req.query.sort === "price_desc") {
      sort = { "variants.0.sellingPricePaise": -1 };
    } else if (req.query.sort === "rating") {
      sort = { rating: -1 };
    } else if (req.query.sort === "newest") {
      sort = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ data: products, page, limit, total });
  } catch (error) {
    console.error("Product list error:", error.message);
    res.status(500).json({ message: "Could not load products" });
  }
});

// Admin: List all products
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: products });
  } catch (error) {
    console.error("Admin product list error:", error.message);
    res.status(500).json({ message: "Could not load products" });
  }
});

// Public: Get single product by slug
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug.toLowerCase().trim(),
      status: "active",
    })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Also fetch related products from same category
    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      status: "active",
    })
      .limit(4)
      .lean();

    res.json({ data: product, related });
  } catch (error) {
    console.error("Product detail error:", error.message);
    res.status(500).json({ message: "Could not load product details" });
  }
});

// Admin: Create product
router.post("/", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const {
      name,
      slug,
      brand,
      category,
      shortDescription,
      description,
      highlights,
      specifications,
      images,
      hsnCode,
      gstRate,
      gstExempt,
      priceIncludesGst,
      codEligible,
      returnWindowDays,
      variants,
      status,
      isTrending,
      isBestSeller,
      isNewArrival,
    } = req.body;

    if (!name || !slug || !category || !hsnCode || gstRate === undefined) {
      return res.status(400).json({
        message: "Name, slug, category, HSN code, and GST rate are required.",
      });
    }

    if (!variants || variants.length === 0) {
      return res.status(400).json({ message: "At least one variant is required." });
    }

    const existing = await Product.findOne({ slug: slug.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "A product with this slug already exists." });
    }

    const product = await Product.create({
      name,
      slug: slug.toLowerCase().trim(),
      brand,
      category,
      shortDescription,
      description,
      highlights: highlights || [],
      specifications: specifications || [],
      images: images || [],
      hsnCode,
      gstRate,
      gstExempt: !!gstExempt,
      priceIncludesGst: priceIncludesGst !== undefined ? priceIncludesGst : true,
      codEligible: codEligible !== undefined ? codEligible : true,
      returnWindowDays: returnWindowDays || 7,
      variants,
      status: status || "active",
      isTrending: !!isTrending,
      isBestSeller: !!isBestSeller,
      isNewArrival: !!isNewArrival,
    });

    // Record initial inventory movements for each variant
    for (const v of product.variants) {
      if (v.stockQuantity > 0) {
        await InventoryMovement.create({
          productId: product._id,
          sku: v.sku,
          quantityChange: v.stockQuantity,
          previousStock: 0,
          newStock: v.stockQuantity,
          reason: "restock",
          referenceId: "initial_product_creation",
          performedBy: req.session.adminName || "admin",
        });
      }
    }

    res.status(201).json({ message: "Product created successfully", data: product });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: error.message || "Could not create product" });
  }
});

// Admin: Direct Image Upload to Cloudinary (Multiple Images supported)
router.post(
  "/upload-images",
  requireAdmin,
  requireRole("catalogue"),
  (req, res) => {
    upload.array("images", 10)(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided." });
      }

      try {
        const uploadPromises = req.files.map(async (file) => {
          const result = await uploadBufferToCloudinary(file.buffer, {
            folder: "shopecomira/products",
          });
          return {
            url: result.secure_url,
            altText: file.originalname,
            publicId: result.public_id,
          };
        });

        const uploadedImages = await Promise.all(uploadPromises);

        res.json({
          message: `${uploadedImages.length} image(s) uploaded to Cloudinary successfully`,
          images: uploadedImages,
        });
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        res.status(500).json({
          message:
            uploadError.message ||
            "Failed to upload image(s) to Cloudinary. Please check Cloudinary configuration.",
        });
      }
    });
  }
);

// Admin: Delete image from Cloudinary (optional cleanup)
router.post(
  "/delete-image",
  requireAdmin,
  requireRole("catalogue"),
  async (req, res) => {
    try {
      const { publicId } = req.body;
      if (!publicId) {
        return res.status(400).json({ message: "publicId is required in request body" });
      }
      await deleteFromCloudinary(publicId);
      res.json({ message: "Image removed from Cloudinary successfully" });
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      res.status(500).json({ message: "Could not remove image from Cloudinary" });
    }
  }
);

// Admin: Toggle block / unblock product status
router.patch(
  "/:id/toggle-block",
  requireAdmin,
  requireRole("catalogue"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const newStatus = product.status === "blocked" ? "active" : "blocked";
      product.status = newStatus;
      await product.save();

      res.json({
        message: `Product ${newStatus === "blocked" ? "blocked" : "unblocked"} successfully`,
        data: product,
      });
    } catch (error) {
      console.error("Toggle block error:", error);
      res.status(500).json({ message: "Could not update product status" });
    }
  }
);

// Admin: Update product
router.put("/:id", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", data: product });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: error.message || "Could not update product" });
  }
});


// Admin: Adjust variant stock with audit ledger
router.patch(
  "/:id/stock",
  requireAdmin,
  requireRole("catalogue"),
  async (req, res) => {
    try {
      const { sku, quantityChange, reason } = req.body;
      if (!sku || quantityChange === undefined || !reason) {
        return res.status(400).json({
          message: "sku, quantityChange, and reason are required.",
        });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const variant = product.variants.find((v) => v.sku === sku);
      if (!variant) {
        return res.status(404).json({ message: `Variant SKU ${sku} not found.` });
      }

      const previousStock = variant.stockQuantity;
      const newStock = Math.max(previousStock + Number(quantityChange), 0);
      variant.stockQuantity = newStock;
      await product.save();

      // Record audit ledger
      await InventoryMovement.create({
        productId: product._id,
        sku,
        quantityChange: Number(quantityChange),
        previousStock,
        newStock,
        reason,
        performedBy: req.session.adminName || "admin",
      });

      res.json({
        message: "Stock updated successfully",
        data: { sku, previousStock, newStock },
      });
    } catch (error) {
      console.error("Stock adjust error:", error);
      res.status(500).json({ message: "Could not update stock" });
    }
  }
);

// Admin: Delete/Archive product
router.delete("/:id", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Could not delete product" });
  }
});

export default router;