const express = require("express");
const cors = require("cors");
const productsRouter = require("./products");
const ordersRouter = require("./orders");
const usersRouter = require("./users");
const testimonialsRouter = require("./testimonials");
const adminRouter = require("./admin");
const cartRouter = require("./cart");
const contactRouter = require("./contact");

/**
 * Main API Router - Combines all route modules with CORS
 */
// eslint-disable-next-line new-cap
const router = express.Router();

// Enable CORS for all routes - simplified for debugging
router.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Route modules
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/users", usersRouter);
router.use("/testimonials", testimonialsRouter);
router.use("/admin", adminRouter);
router.use("/cart", cartRouter);
router.use("/contact", contactRouter);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Get server time (legacy endpoint)
router.get("/server-time", (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
  });
});

// Debug endpoint to test email configuration
router.get("/debug/email", async (req, res) => {
  try {
    const EmailService = require("../services/EmailService");

    console.log("🔍 Debug: Testing email service initialization...");
    const initialized = await EmailService.initialize();

    res.json({
      success: true,
      message: "Email debug test completed",
      emailServiceInitialized: initialized,
      emailServiceAvailable: EmailService.isAvailable(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Debug: Email test failed:", error);
    res.status(500).json({
      success: false,
      message: "Email debug test failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Debug endpoint to check environment variables
router.get("/debug/env", (req, res) => {
  try {
    console.log("🔍 Debug: Checking environment variables...");

    const envCheck = {
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      NODE_ENV: process.env.NODE_ENV || "not set",
      hasProcessEnv: typeof process.env === "object",
      envKeys: Object.keys(process.env).length,
    };

    console.log("🔍 Environment check:", envCheck);

    res.json({
      success: true,
      message: "Environment variables check completed",
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Debug: Environment check failed:", error);
    res.status(500).json({
      success: false,
      message: "Environment check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
