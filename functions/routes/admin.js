const express = require("express");
const {verifyAdminToken} = require("../middleware/adminAuth");

// Import modular admin route modules
// Core functionality
const authRoutes = require("./admin/auth");
const dashboardRoutes = require("./admin/dashboard");

// Business operations
const productRoutes = require("./admin/products");
const orderRoutes = require("./admin/orders");
const userRoutes = require("./admin/users");

// Content management
const contentRoutes = require("./admin/content");
const contactMessageRoutes = require("./admin/contact-messages");

// eslint-disable-next-line new-cap
const router = express.Router();

// ========================
// AUTHENTICATION ROUTES (No auth required)
// ========================
router.use("/", authRoutes);

// ========================
// AUTHENTICATED ROUTES
// ========================
// Apply admin authentication to all routes below this point
router.use(verifyAdminToken);

// Mount modular route modules
router.use("/dashboard", dashboardRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/users", userRoutes);
router.use("/content", contentRoutes);
router.use("/contact-messages", contactMessageRoutes);

// Legacy analytics endpoint (redirect to dashboard)
router.get("/analytics", (req, res, next) => {
  req.url = "/dashboard/analytics";
  dashboardRoutes(req, res, next);
});

module.exports = router;
