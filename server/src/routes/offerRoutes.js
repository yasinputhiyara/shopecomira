import { Router } from "express";
import Offer from "../models/Offer.js";
import { requireAdmin, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// Public: List active offers (for storefront banner and promo hints)
router.get("/active", async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true }).lean();
    res.json({ data: offers });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch active offers" });
  }
});

// Admin: List all offers
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 }).lean();
    res.json({ data: offers });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch offers" });
  }
});

// Admin: Create offer
router.post("/", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ message: "Offer created successfully", data: offer });
  } catch (error) {
    res.status(500).json({ message: error.message || "Could not create offer" });
  }
});

// Admin: Update offer
router.put("/:id", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.json({ message: "Offer updated successfully", data: offer });
  } catch (error) {
    res.status(500).json({ message: error.message || "Could not update offer" });
  }
});

// Admin: Delete offer
router.delete("/:id", requireAdmin, requireRole("catalogue"), async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete offer" });
  }
});

export default router;
