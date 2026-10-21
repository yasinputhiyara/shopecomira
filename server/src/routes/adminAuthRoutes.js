import { Router } from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

const router = Router();

// POST /api/admin/setup - Create initial owner if none exists
router.post("/setup", async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ message: "Admin account is already set up." });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        message: "Please provide a valid name, email, and password (at least 6 characters).",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "owner",
      isActive: true,
    });

    req.session.adminId = newAdmin._id.toString();
    req.session.adminRole = newAdmin.role;
    req.session.adminName = newAdmin.name;
    req.session.adminEmail = newAdmin.email;

    res.status(201).json({
      message: "Owner admin created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    console.error("Setup error:", err);
    res.status(500).json({ message: "Server error setting up admin" });
  }
});

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    }).select("+passwordHash");

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.session.adminId = admin._id.toString();
    req.session.adminRole = admin.role;
    req.session.adminName = admin.name;
    req.session.adminEmail = admin.email;

    res.json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/admin/me
router.get("/me", async (req, res) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const admin = await Admin.findById(req.session.adminId).lean();
    if (!admin || !admin.isActive) {
      req.session.destroy();
      return res.status(401).json({ message: "Session expired or user inactive" });
    }

    res.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Check session error:", err);
    res.status(500).json({ message: "Server error verifying session" });
  }
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("shopecomira.sid");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
