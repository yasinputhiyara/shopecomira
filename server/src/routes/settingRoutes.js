import { Router } from "express";
import StoreSetting from "../models/StoreSetting.js";
import { requireAdmin, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// Public: Get storefront configuration
router.get("/public", async (req, res) => {
  try {
    let settings = await StoreSetting.findOne().lean();
    if (!settings) {
      settings = await StoreSetting.create({});
    }

    res.json({
      storeName: settings.storeName,
      tagline: settings.tagline,
      whatsappNumber: settings.whatsappNumber,
      whatsappDefaultMessage: settings.whatsappDefaultMessage,
      supportPhone: settings.supportPhone,
      supportEmail: settings.supportEmail,
      freeShippingThresholdPaise: settings.freeShippingThresholdPaise,
      standardShippingFeePaise: settings.standardShippingFeePaise,
      codFeePaise: settings.codFeePaise,
      prepaidDiscountPercent: settings.prepaidDiscountPercent,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load store settings" });
  }
});

// Admin: Get all settings
router.get("/", requireAdmin, async (req, res) => {
  try {
    let settings = await StoreSetting.findOne().lean();
    if (!settings) {
      settings = await StoreSetting.create({});
    }
    res.json({ data: settings });
  } catch (error) {
    res.status(500).json({ message: "Could not load settings" });
  }
});

// Admin: Update settings
router.put("/", requireAdmin, requireRole("owner"), async (req, res) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = new StoreSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ message: "Settings updated successfully", data: settings });
  } catch (error) {
    res.status(500).json({ message: "Could not save settings" });
  }
});

export default router;
