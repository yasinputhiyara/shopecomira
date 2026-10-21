import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Order from "../models/Order.js";
import OtpChallenge from "../models/OtpChallenge.js";
import { sendOtpEmail } from "../services/emailService.js";

const router = Router();

// Middleware to require logged-in user
export const requireCustomerAuth = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.isActive) {
      delete req.session.userId;
      return res.status(401).json({ message: "Session expired or user inactive." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error authenticating user" });
  }
};

// Helper: Link past guest orders by email or phone to this user
async function linkGuestOrders(userId, email, phone) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();
    await Order.updateMany(
      {
        userId: null,
        $or: [{ "customer.email": cleanEmail }, { "customer.phone": cleanPhone }],
      },
      { $set: { userId } }
    );
  } catch (err) {
    console.warn("Failed to link guest orders:", err.message);
  }
}

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function publicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    addresses: user.addresses || [],
    createdAt: user.createdAt,
  };
}

function validateRegisterFields({ fullName, email, phone, password }) {
  if (!fullName || !fullName.trim()) {
    return "Full name is required.";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "A valid email address is required.";
  }
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (cleanPhone.length !== 10) {
    return "A valid 10-digit mobile phone number is required.";
  }
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
}

async function issueRegisterOtp({ email, fullName, phone, passwordHash }) {
  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(code, 10);
  const now = new Date();

  await OtpChallenge.findOneAndUpdate(
    { email, purpose: "register" },
    {
      email,
      purpose: "register",
      codeHash,
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
      attempts: 0,
      lastSentAt: now,
      payload: { fullName, phone, passwordHash },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const mail = await sendOtpEmail({ to: email, code, purpose: "register" });
  return { mail, retryAfterSeconds: Math.ceil(OTP_RESEND_MS / 1000) };
}

// POST /api/user/register — OTP is required; this path no longer creates accounts
router.post("/register", (_req, res) => {
  res.status(410).json({
    message: "Direct registration is disabled. Request an OTP with /user/register/send-otp, then verify it.",
  });
});

// POST /api/user/register/send-otp
router.post("/register/send-otp", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const validationError = validateRegisterFields({ fullName, email, phone, password });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/\D/g, "");

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists. Please log in." });
    }

    const existingChallenge = await OtpChallenge.findOne({ email: normalizedEmail, purpose: "register" });
    if (existingChallenge?.lastSentAt) {
      const waitMs = OTP_RESEND_MS - (Date.now() - existingChallenge.lastSentAt.getTime());
      if (waitMs > 0) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.`,
          retryAfterSeconds: Math.ceil(waitMs / 1000),
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { mail, retryAfterSeconds } = await issueRegisterOtp({
      email: normalizedEmail,
      fullName: fullName.trim(),
      phone: cleanPhone,
      passwordHash,
    });

    res.json({
      message: mail.delivered
        ? "Verification code sent to your email."
        : "Verification code generated. Check the server console if you did not receive an email.",
      email: normalizedEmail,
      delivered: mail.delivered,
      retryAfterSeconds,
    });
  } catch (err) {
    console.error("Send register OTP error:", err);
    res.status(500).json({ message: err.message || "Failed to send verification code." });
  }
});

// POST /api/user/register/resend-otp
router.post("/register/resend-otp", async (req, res) => {
  try {
    const email = (req.body?.email || "").toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    const challenge = await OtpChallenge.findOne({ email, purpose: "register" });
    if (!challenge) {
      return res.status(404).json({ message: "No pending registration found for this email. Start registration again." });
    }

    const waitMs = OTP_RESEND_MS - (Date.now() - challenge.lastSentAt.getTime());
    if (waitMs > 0) {
      return res.status(429).json({
        message: `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.`,
        retryAfterSeconds: Math.ceil(waitMs / 1000),
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return res.status(409).json({ message: "An account with this email already exists. Please log in." });
    }

    const { mail, retryAfterSeconds } = await issueRegisterOtp({
      email,
      fullName: challenge.payload.fullName,
      phone: challenge.payload.phone,
      passwordHash: challenge.payload.passwordHash,
    });

    res.json({
      message: mail.delivered
        ? "A new verification code was sent to your email."
        : "A new verification code was generated. Check the server console if you did not receive an email.",
      email,
      delivered: mail.delivered,
      retryAfterSeconds,
    });
  } catch (err) {
    console.error("Resend register OTP error:", err);
    res.status(500).json({ message: err.message || "Failed to resend verification code." });
  }
});

// POST /api/user/register/verify-otp
router.post("/register/verify-otp", async (req, res) => {
  try {
    const email = (req.body?.email || "").toLowerCase().trim();
    const otp = String(req.body?.otp || "").replace(/\D/g, "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email address is required." });
    }
    if (otp.length !== 6) {
      return res.status(400).json({ message: "Enter the 6-digit verification code." });
    }

    const challenge = await OtpChallenge.findOne({ email, purpose: "register" });
    if (!challenge) {
      return res.status(400).json({ message: "No verification code found. Please register again." });
    }

    if (challenge.expiresAt.getTime() < Date.now()) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return res.status(400).json({ message: "Verification code expired. Please request a new one." });
    }

    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return res.status(429).json({ message: "Too many incorrect attempts. Please register again." });
    }

    const isMatch = await bcrypt.compare(otp, challenge.codeHash);
    if (!isMatch) {
      challenge.attempts += 1;
      await challenge.save();
      const remaining = OTP_MAX_ATTEMPTS - challenge.attempts;
      return res.status(400).json({
        message: remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many incorrect attempts. Please register again.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return res.status(409).json({ message: "An account with this email already exists. Please log in." });
    }

    const user = await User.create({
      fullName: challenge.payload.fullName,
      email,
      phone: challenge.payload.phone,
      passwordHash: challenge.payload.passwordHash,
      isEmailVerified: true,
      lastLogin: new Date(),
    });

    await OtpChallenge.deleteOne({ _id: challenge._id });
    req.session.userId = user._id.toString();
    await linkGuestOrders(user._id, user.email, user.phone);

    res.status(201).json({
      message: "Registration successful. Welcome to Shopecomira!",
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Verify register OTP error:", err);
    res.status(500).json({ message: err.message || "Failed to verify code." });
  }
});

// POST /api/user/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail, isActive: true }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    user.lastLogin = new Date();
    await user.save();

    req.session.userId = user._id.toString();

    // Link any recent guest orders
    await linkGuestOrders(user._id, user.email, user.phone);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("User login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST /api/user/logout
router.post("/logout", (req, res) => {
  if (req.session) {
    delete req.session.userId;
  }
  res.json({ message: "Logged out successfully" });
});

// GET /api/user/me
router.get("/me", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const user = await User.findById(req.session.userId).lean();
    if (!user || !user.isActive) {
      delete req.session.userId;
      return res.status(401).json({ message: "Session expired or user inactive." });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Fetch me error:", err);
    res.status(500).json({ message: "Server error retrieving user profile" });
  }
});

// PUT /api/user/profile
router.put("/profile", requireCustomerAuth, async (req, res) => {
  try {
    const { fullName, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+passwordHash");

    if (fullName && fullName.trim()) {
      user.fullName = fullName.trim();
    }

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
      }
      user.phone = cleanPhone;
    }

    // Password change
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters." });
      }
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password." });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password does not match." });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
});

// POST /api/user/addresses - Add new address
router.post("/addresses", requireCustomerAuth, async (req, res) => {
  try {
    const { fullName, phone, street, landmark, city, state, pincode, isDefault } = req.body;

    if (!street || !city || !pincode) {
      return res.status(400).json({ message: "Street, city, and pincode are required." });
    }

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const isFirst = user.addresses.length === 0;

    user.addresses.push({
      fullName: (fullName || user.fullName).trim(),
      phone: (phone || user.phone).trim(),
      street: street.trim(),
      landmark: (landmark || "").trim(),
      city: city.trim(),
      state: state || "Maharashtra",
      pincode: pincode.replace(/\D/g, ""),
      isDefault: isDefault || isFirst,
    });

    await user.save();

    res.status(201).json({
      message: "Address saved successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: err.message || "Failed to save address" });
  }
});

// PUT /api/user/addresses/:addressId - Update address
router.put("/addresses/:addressId", requireCustomerAuth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { fullName, phone, street, landmark, city, state, pincode, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    if (fullName) address.fullName = fullName.trim();
    if (phone) address.phone = phone.replace(/\D/g, "");
    if (street) address.street = street.trim();
    if (landmark !== undefined) address.landmark = landmark.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state;
    if (pincode) address.pincode = pincode.replace(/\D/g, "");

    await user.save();

    res.json({
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("Update address error:", err);
    res.status(500).json({ message: err.message || "Failed to update address" });
  }
});

// DELETE /api/user/addresses/:addressId - Delete address
router.delete("/addresses/:addressId", requireCustomerAuth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      message: "Address removed",
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ message: err.message || "Failed to delete address" });
  }
});

// GET /api/user/orders - Get logged in user's complete order history
router.get("/orders", requireCustomerAuth, async (req, res) => {
  try {
    const user = req.user;
    const cleanEmail = user.email.toLowerCase().trim();
    const cleanPhone = user.phone.trim();

    const orders = await Order.find({
      $or: [
        { userId: user._id },
        { "customer.email": cleanEmail },
        { "customer.phone": cleanPhone },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      total: orders.length,
      orders,
    });
  } catch (err) {
    console.error("Fetch user orders error:", err);
    res.status(500).json({ message: "Could not load orders." });
  }
});

// GET /api/user/orders/:orderNumber - Single order details for user
router.get("/orders/:orderNumber", requireCustomerAuth, async (req, res) => {
  try {
    const user = req.user;
    const { orderNumber } = req.params;

    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase().trim(),
      $or: [
        { userId: user._id },
        { "customer.email": user.email.toLowerCase().trim() },
        { "customer.phone": user.phone.trim() },
      ],
    }).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found in your account." });
    }

    res.json({ order });
  } catch (err) {
    console.error("Fetch single order error:", err);
    res.status(500).json({ message: "Could not load order details." });
  }
});

export default router;
