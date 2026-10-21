import { Router } from "express";
import Category from "../models/Category.js";
import { requireAdmin, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// Public: List active categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({ data: categories });
  } catch (error) {
    console.error("Category list error:", error.message);
    res.status(500).json({ message: "Could not load categories" });
  }
});

// Admin: List all categories (including inactive)
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({ data: categories });
  } catch (error) {
    console.error("Admin category list error:", error.message);
    res.status(500).json({ message: "Could not load categories" });
  }
});

// Admin: Create category
router.post("/", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const { name, slug, description, imageUrl, isActive, sortOrder } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }

    const existing = await Category.findOne({ slug: slug.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "A category with this slug already exists" });
    }

    const category = await Category.create({
      name,
      slug: slug.toLowerCase().trim(),
      description,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    });

    res.status(201).json({ message: "Category created", data: category });
  } catch (error) {
    console.error("Create category error:", error.message);
    res.status(500).json({ message: "Could not create category" });
  }
});

// Admin: Update category
router.put("/:id", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const { name, slug, description, imageUrl, isActive, sortOrder } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slug ? slug.toLowerCase().trim() : undefined,
        description,
        imageUrl,
        isActive,
        sortOrder,
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated", data: category });
  } catch (error) {
    console.error("Update category error:", error.message);
    res.status(500).json({ message: "Could not update category" });
  }
});

// Admin: Delete category
router.delete("/:id", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error.message);
    res.status(500).json({ message: "Could not delete category" });
  }
});

export default router;