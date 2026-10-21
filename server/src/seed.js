import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import Offer from "./models/Offer.js";
import StoreSetting from "./models/StoreSetting.js";
import InventoryMovement from "./models/InventoryMovement.js";

dotenv.config();

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas!");

    // 1. Seed or Update Store Settings
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = await StoreSetting.create({
        storeName: "Shopecomira",
        tagline: "Trending Innovations & Fast-Moving Lifestyle Products",
        legalBusinessName: "Shopecomira Retail Enterprises Pvt Ltd",
        gstin: "27AABCU9603R1ZM",
        pan: "AABCU9603R",
        registeredAddress: "Suite 402, Commerce Hub, Bandra West, Mumbai, Maharashtra 400050",
        state: "Maharashtra",
        stateCode: "27",
        supportEmail: "support@shopecomira.com",
        supportPhone: "+91 98765 43210",
        whatsappNumber: "919876543210",
        whatsappDefaultMessage: "Hello Shopecomira team, I would like to inquire about:",
        freeShippingThresholdPaise: 99900, // ₹999 free shipping
        standardShippingFeePaise: 7000,   // ₹70 shipping
        codFeePaise: 5000,                // ₹50 COD fee
        prepaidDiscountPercent: 5,        // Extra 5% OFF on Online Payment
        invoicePrefix: "INV",
        currentInvoiceSequence: 1000,
      });
      console.log("✓ Store Settings initialized");
    }

    // 2. Seed Default Owner Admin
    const existingAdmin = await Admin.findOne({ email: "admin@shopecomira.com" });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("Admin@12345", 10);
      await Admin.create({
        name: "Store Administrator",
        email: "admin@shopecomira.com",
        passwordHash,
        role: "owner",
        isActive: true,
      });
      console.log("✓ Default admin created: admin@shopecomira.com / Admin@12345");
    }

    // 3. Seed Offers (Prepaid, Multi-Item, Coupon)
    await Offer.deleteMany({});
    await Offer.create([
      {
        name: "Online Payment Reward",
        description: "Get an extra 5% instant discount when you pay via UPI or Cards",
        type: "prepaid",
        discountPercent: 5,
        isActive: true,
      },
      {
        name: "Multi-Pack Super Saver",
        description: "Buy 2 get 10% off, Buy 3 or more get 15% off automatically",
        type: "multi_item",
        tiers: [
          { minQuantity: 2, discountPercent: 10 },
          { minQuantity: 3, discountPercent: 15 },
        ],
        isActive: true,
      },
      {
        name: "Welcome First Order",
        description: "Use coupon WELCOME10 for 10% off your order (up to ₹300)",
        type: "coupon",
        code: "WELCOME10",
        discountPercent: 10,
        maxDiscountPaise: 30000, // Max ₹300 off
        minCartPaise: 49900,     // Min ₹499
        isActive: true,
      },
      {
        name: "Mega Festive Deal",
        description: "Flat ₹150 off on orders above ₹1,500",
        type: "coupon",
        code: "TREND150",
        discountPaise: 15000,
        minCartPaise: 150000,
        isActive: true,
      },
    ]);
    console.log("✓ Offers & Coupons seeded");

    // 4. Seed Categories
    await Category.deleteMany({});
    const categoriesData = [
      {
        name: "Smart Electronics",
        slug: "smart-electronics",
        description: "Next-gen smart gadgets, wireless earbuds, smart wearables, and audio gear.",
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
        sortOrder: 1,
      },
      {
        name: "Home & Kitchen Innovations",
        slug: "home-kitchen-innovations",
        description: "Effortless cleaning tools, ergonomic kitchen appliances, and modern home tech.",
        imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
        sortOrder: 2,
      },
      {
        name: "Lifestyle & Travel",
        slug: "lifestyle-travel",
        description: "Anti-theft backpacks, smart organizers, thermos bottles, and travel essentials.",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        sortOrder: 3,
      },
      {
        name: "Fitness & Wellness",
        slug: "fitness-wellness",
        description: "Deep tissue massage guns, smart resistance trainers, and posture correctors.",
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
        sortOrder: 4,
      },
    ];

    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`✓ ${insertedCategories.length} categories seeded`);

    const catMap = {};
    for (const c of insertedCategories) {
      catMap[c.slug] = c._id;
    }

    // 5. Seed Trending Products
    await Product.deleteMany({});
    const productsData = [
      {
        name: "AeroTune ANC Pro Wireless Earbuds with Spatial Audio",
        slug: "aerotune-anc-pro-wireless-earbuds",
        brand: "AeroTune",
        category: catMap["smart-electronics"],
        shortDescription: "Ultra-low latency Bluetooth 5.4 earbuds with active noise cancellation, 42-hour battery life, and crystal HD dual mic.",
        description: "Experience audiophile-grade wireless sound with AeroTune ANC Pro. Engineered with 13mm diamond-like carbon drivers and intelligent 35dB Active Noise Cancellation that blocks out urban commute hum. Features Transparency mode, IPX5 water resistance for workouts, and ultra-fast Type-C quick charging delivering 4 hours of playtime in just 10 minutes.",
        highlights: [
          "35dB Hybrid Active Noise Cancellation",
          "42-Hour Total Playtime with Qi Wireless Charging Case",
          "Quad-Mic ENC for studio-clear phone calls",
          "IPX5 Sweat & Water Resistance",
          "Ultra-low 45ms latency gaming mode",
        ],
        specifications: [
          { label: "Bluetooth Version", value: "5.4 with AAC & SBC codecs" },
          { label: "Driver Size", value: "13mm Dynamic DLC Drivers" },
          { label: "Battery Life", value: "8.5 hrs (buds) + 33.5 hrs (case)" },
          { label: "Charging Port", value: "USB Type-C & Wireless Qi" },
          { label: "Warranty", value: "1 Year Replacement Warranty" },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
            altText: "AeroTune ANC Pro Earbuds in Charging Case",
          },
          {
            url: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=900&q=80",
            altText: "AeroTune Earbuds Close-up",
          },
        ],
        hsnCode: "8518",
        gstRate: 18,
        priceIncludesGst: true,
        codEligible: true,
        returnWindowDays: 7,
        rating: 4.9,
        reviewCount: 128,
        isTrending: true,
        isBestSeller: true,
        isNewArrival: false,
        variants: [
          {
            sku: "AERO-ANC-BLK",
            options: [{ name: "Color", value: "Stealth Black" }],
            mrpPaise: 499900,         // MRP ₹4,999
            sellingPricePaise: 189900, // Selling ₹1,899 (62% off)
            stockQuantity: 45,
          },
          {
            sku: "AERO-ANC-WHT",
            options: [{ name: "Color", value: "Ivory White" }],
            mrpPaise: 499900,
            sellingPricePaise: 189900,
            stockQuantity: 30,
          },
        ],
      },
      {
        name: "LuminaTrack Ultra AMOLED Smartwatch with Bluetooth Calling",
        slug: "luminatrack-ultra-amoled-smartwatch",
        brand: "Lumina",
        category: catMap["smart-electronics"],
        shortDescription: "Brilliant 1.96-inch Always-on AMOLED display, zinc-alloy unibody, 24/7 heart rate & SpO2 monitor, and IP68 waterproof design.",
        description: "The LuminaTrack Ultra combines rugged luxury with precision health tracking. Featuring an ultra-bright 1000 nits AMOLED screen protected by curved sapphire glass. Make and take crystal-clear calls directly from your wrist with the built-in speaker and noise-filtered microphone. Includes 110+ sports modes, sleep staging, stress tracking, and up to 10 days of battery life.",
        highlights: [
          "1.96-inch AMOLED Display with 1000 nits peak brightness",
          "Crisp Bluetooth 5.3 Calling with phonebook sync",
          "Advanced BioTracker PPG sensor for HR, SpO2 & HRV",
          "IP68 Dust & 3ATM Water Resistant",
          "10-Day Battery Life on a single charge",
        ],
        specifications: [
          { label: "Display", value: "1.96'' AMOLED 410x502 resolution" },
          { label: "Case Material", value: "Aircraft-grade Zinc Alloy" },
          { label: "Sensors", value: "Optical Heart Rate, SpO2, Accelerometer" },
          { label: "Compatibility", value: "iOS 12+ & Android 8+" },
          { label: "Warranty", value: "1 Year Manufacturer Warranty" },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=900&q=80",
            altText: "LuminaTrack Smartwatch on Desk",
          },
          {
            url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
            altText: "Smartwatch angled view",
          },
        ],
        hsnCode: "8517",
        gstRate: 18,
        priceIncludesGst: true,
        codEligible: true,
        returnWindowDays: 7,
        rating: 4.8,
        reviewCount: 94,
        isTrending: true,
        isBestSeller: false,
        isNewArrival: true,
        variants: [
          {
            sku: "LUM-ULTRA-SLV",
            options: [{ name: "Color", value: "Silver Chrome" }],
            mrpPaise: 699900,
            sellingPricePaise: 249900, // ₹2,499
            stockQuantity: 28,
          },
          {
            sku: "LUM-ULTRA-BLK",
            options: [{ name: "Color", value: "Midnight Black" }],
            mrpPaise: 699900,
            sellingPricePaise: 249900,
            stockQuantity: 35,
          },
        ],
      },
      {
        name: "SonicWhirl Cordless High-Pressure Electric Spin Scrubber",
        slug: "sonicwhirl-cordless-electric-spin-scrubber",
        brand: "HomeZen",
        category: catMap["home-kitchen-innovations"],
        shortDescription: "360-degree high-torque electric cleaning brush with extendable handle and 6 interchangeable heads for bathroom, tiles & kitchen.",
        description: "Transform arduous scrubbing into effortless cleaning with the SonicWhirl Electric Spin Scrubber. Powered by a 25W heavy-duty motor rotating at up to 450 RPM, it melts away soap scum, grout grime, hard water stains, and grease in seconds without kneeling or bending over. Comes with an adjustable 45-inch extension pole and 6 specialized brush heads.",
        highlights: [
          "Powerful 450 RPM dual-speed motor",
          "6 Interchangeable heads for corners, glass, grout, and pans",
          "Telescopic handle extends from 25 to 45 inches",
          "IPX7 waterproof head for safe sink & shower cleaning",
          "2500mAh USB-C rechargeable battery (up to 90 mins runtime)",
        ],
        specifications: [
          { label: "Motor Power", value: "25W High Torque Brushless" },
          { label: "RPM", value: "300 RPM (Normal) / 450 RPM (Boost)" },
          { label: "Battery", value: "2500mAh Lithium-Ion" },
          { label: "Weight", value: "980 grams" },
          { label: "Warranty", value: "6 Months Replacement Warranty" },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
            altText: "Electric Spin Scrubber cleaning bathroom tiles",
          },
          {
            url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=80",
            altText: "Spin Scrubber with all attachments",
          },
        ],
        hsnCode: "8509",
        gstRate: 18,
        priceIncludesGst: true,
        codEligible: true,
        returnWindowDays: 7,
        rating: 4.7,
        reviewCount: 76,
        isTrending: true,
        isBestSeller: true,
        isNewArrival: false,
        variants: [
          {
            sku: "SW-SCRUB-WHITE",
            options: [{ name: "Kit", value: "Standard Kit (6 Heads)" }],
            mrpPaise: 399900,
            sellingPricePaise: 169900, // ₹1,699
            stockQuantity: 40,
          },
          {
            sku: "SW-SCRUB-DELUXE",
            options: [{ name: "Kit", value: "Deluxe Kit (8 Heads + Wall Mount)" }],
            mrpPaise: 499900,
            sellingPricePaise: 199900, // ₹1,999
            stockQuantity: 20,
          },
        ],
      },
      {
        name: "PureBlend Portable USB-C Rechargeable Smoothie Blender",
        slug: "pureblend-portable-smoothie-blender",
        brand: "NutriPulse",
        category: catMap["home-kitchen-innovations"],
        shortDescription: "Compact 450ml personal blender with 6-leaf 304 stainless steel blades and magnetic safety lock for fresh smoothies anywhere.",
        description: "Blend fresh smoothies, protein shakes, and baby purées in under 30 seconds wherever you are. PureBlend features 6 laser-cut serrated blades spinning at 22,000 RPM, effortlessly crushing ice and frozen fruits. Made from BPA-free food-grade Tritan material with an airtight spill-proof sip lid.",
        highlights: [
          "Crushes ice & frozen fruits with 22,000 RPM speed",
          "6-Point 304 Stainless Steel Blades",
          "Food-Grade BPA-Free Tritan 450ml Cup",
          "Self-cleaning: add water, soap and double-tap",
          "Up to 18 blends on a single 3-hour Type-C charge",
        ],
        specifications: [
          { label: "Capacity", value: "450 ml" },
          { label: "Blade Material", value: "Food-Grade 304 Stainless Steel" },
          { label: "Battery", value: "4000mAh Dual-Cell" },
          { label: "Safety", value: "Magnetic sensor auto-shutoff" },
          { label: "Warranty", value: "6 Months Warranty" },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80",
            altText: "Portable Smoothie Blender with fresh fruit",
          },
        ],
        hsnCode: "8509",
        gstRate: 18,
        priceIncludesGst: true,
        codEligible: true,
        returnWindowDays: 7,
        rating: 4.8,
        reviewCount: 112,
        isTrending: false,
        isBestSeller: true,
        isNewArrival: false,
        variants: [
          {
            sku: "PBL-450-MINT",
            options: [{ name: "Color", value: "Mint Green" }],
            mrpPaise: 249900,
            sellingPricePaise: 99900, // ₹999
            stockQuantity: 50,
          },
          {
            sku: "PBL-450-CORAL",
            options: [{ name: "Color", value: "Blush Pink" }],
            mrpPaise: 249900,
            sellingPricePaise: 99900,
            stockQuantity: 35,
          },
        ],
      },
      {
        name: "ThermaGrip Smart Temperature Display Insulated Flask 500ml",
        slug: "thermagrip-smart-temperature-display-flask",
        brand: "ThermaGrip",
        category: catMap["lifestyle-travel"],
        shortDescription: "Double-wall vacuum insulated 304 stainless steel thermos bottle with LED touch temperature display and built-in tea infuser.",
        description: "Never burn your tongue again. The ThermaGrip smart bottle features an integrated waterproof LED touch screen on the lid that displays your drink's exact temperature in real time. Triple-layer vacuum insulation keeps beverages steaming hot for 12 hours or ice-cold for 24 hours.",
        highlights: [
          "HD LED Touch Temperature Display on Cap",
          "Keeps drinks Hot for 12h or Cold for 24h",
          "Double-wall Food Grade 304 Stainless Steel",
          "Leak-proof silicone seal ring with removable tea infuser filter",
          "Eco-friendly, sweat-free matte powder coat finish",
        ],
        specifications: [
          { label: "Capacity", value: "500 ml" },
          { label: "Material", value: "SUS 304 Food Grade Stainless Steel" },
          { label: "Screen Life", value: "Up to 50,000 taps (no charge needed)" },
          { label: "Weight", value: "320 grams" },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
            altText: "Matte Black Smart Thermal Flask",
          },
        ],
        hsnCode: "9617",
        gstRate: 18,
        priceIncludesGst: true,
        codEligible: true,
        returnWindowDays: 7,
        rating: 4.7,
        reviewCount: 65,
        isTrending: true,
        isBestSeller: false,
        isNewArrival: true,
        variants: [
          {
            sku: "TG-500-BLK",
            options: [{ name: "Color", value: "Matte Obsidian Black" }],
            mrpPaise: 149900,
            sellingPricePaise: 59900, // ₹599
            stockQuantity: 60,
          },
          {
            sku: "TG-500-BLU",
            options: [{ name: "Color", value: "Midnight Navy Blue" }],
            mrpPaise: 149900,
            sellingPricePaise: 59900,
            stockQuantity: 40,
          },
        ],
      },
      {
        name: "VoltRelief Deep Tissue Mini Percussion Massage Gun",
        slug: "voltrelief-deep-tissue-mini-massage-gun",
        brand: "VoltRelief",
        category: catMap["fitness-wellness"],
        shortDescription: "Pocket-sized 3200 RPM percussion massager with 4 speed gears and 4 interchangeable heads for instant muscle soreness relief.",
        description: "Pocket-sized muscle recovery at your fingertips. The VoltRelief Mini Massage Gun delivers up to 3200 RPM of high-torque percussion therapy into deep tissue, breaking down lactic acid and relieving post-workout stiffness, neck cramps, and lower back tension. Weighs just 410g with ultra-quiet 38dB noise suppression.",
        highlights: [
          "Delivers 10mm stroke amplitude at up to 3200 RPM",
          "Whisper-quiet brushless motor under 40dB",
          "Pocket-sized ergonomic aircraft aluminum body (410g)",
          "4 Specialized massage heads for spine, joints, and large muscles",
          "2000mAh battery provides up to 6 hours continuous therapy",
        ],
        specifications: [
          { label: "Speed Levels", value: "4 Speeds (1800 - 3200 RPM)" },
          { label: "Battery", value: "2000mAh rechargeable Li-Ion" },
          { label: "Charging", value: "Type-C Fast Charge (5V/2A)" },
          { label: "Warranty", value: "1 Year Replacement Warranty" },
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80",
            altText: "Mini Massage Gun with attachment heads",
          },
        ],
        hsnCode: "9019",
        gstRate: 18,
        priceIncludesGst: true,
        codEligible: true,
        returnWindowDays: 7,
        rating: 4.9,
        reviewCount: 88,
        isTrending: true,
        isBestSeller: true,
        isNewArrival: false,
        variants: [
          {
            sku: "VR-MASS-GRY",
            options: [{ name: "Color", value: "Space Grey" }],
            mrpPaise: 449900,
            sellingPricePaise: 179900, // ₹1,799
            stockQuantity: 30,
          },
          {
            sku: "VR-MASS-RED",
            options: [{ name: "Color", value: "Crimson Red" }],
            mrpPaise: 449900,
            sellingPricePaise: 179900,
            stockQuantity: 15,
          },
        ],
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`✓ ${insertedProducts.length} trending products seeded`);

    // Log initial inventory movements
    for (const prod of insertedProducts) {
      for (const v of prod.variants) {
        await InventoryMovement.create({
          productId: prod._id,
          sku: v.sku,
          quantityChange: v.stockQuantity,
          previousStock: 0,
          newStock: v.stockQuantity,
          reason: "restock",
          referenceId: "initial_catalogue_seed",
          performedBy: "seed_script",
        });
      }
    }
    console.log("✓ Initial inventory movements recorded");

    console.log("\n==========================================");
    console.log("SHOPECOMIRA DATABASE SEEDED SUCCESSFULLY!");
    console.log("Admin email:    admin@shopecomira.com");
    console.log("Admin password: Admin@12345");
    console.log("Coupon code:    WELCOME10 (10% off)");
    console.log("Prepaid offer:  5% instant discount on UPI/Cards");
    console.log("==========================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
