const express = require("express");
const multer = require("multer");
const {
  verifyAdminToken,
  requirePermission,
  requireAnyPermission,
} = require("../middleware/adminAuth");

// Import Controllers
const AdminAuthController = require("../controllers/AdminAuthController");
const AdminDashboardController =
  require("../controllers/AdminDashboardController");
const AdminProductController = require("../controllers/AdminProductController");
const AdminOrderController = require("../controllers/AdminOrderController");
const AdminUserController = require("../controllers/AdminUserController");
const AdminContentController = require("../controllers/AdminContentController");

// eslint-disable-next-line new-cap
const router = express.Router();

// Initialize controllers
const authController = new AdminAuthController();
const dashboardController = new AdminDashboardController();
const productController = new AdminProductController();
const orderController = new AdminOrderController();
const userController = new AdminUserController();
const contentController = new AdminContentController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 1 * 1024 * 1024, // 1MB for field values
    fields: 20, // Maximum number of fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * Helper function for conditional multer middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function conditionalMulter(req, res, next) {
  const contentType = req.get("Content-Type") || "";
  console.log("📋 Content-Type:", contentType);

  if (contentType.includes("multipart/form-data")) {
    console.log("📸 Using multer middleware for FormData");
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("❌ Multer error:", err);
        return res.status(400).json({
          success: false,
          message: "File upload error: " + err.message,
        });
      }
      console.log("✅ Multer processed successfully");
      next();
    });
  } else {
    console.log("📄 Skipping multer for JSON/form-encoded data");
    next();
  }
}

// ========================
// AUTHENTICATION ROUTES
// ========================

/**
 * Admin login endpoint - must be before auth middleware
 */
router.post("/login", (req, res) => authController.login(req, res));

// Apply admin authentication to all routes below this point
router.use(verifyAdminToken);

// ========================
// DASHBOARD ROUTES
// ========================

/**
 * Get dashboard statistics
 */
router.get("/dashboard/stats",
    requireAnyPermission(["view_analytics", "manage_products",
      "manage_orders"]),
    (req, res) => dashboardController.getDashboardStats(req, res));

/**
 * Get analytics data
 */
router.get("/analytics",
    requirePermission("view_analytics"),
    (req, res) => dashboardController.getAnalytics(req, res));

// ========================
// PRODUCT ROUTES
// ========================

/**
 * Get all products with admin details
 */
router.get("/products",
    requirePermission("manage_products"),
    (req, res) => productController.getProducts(req, res));

/**
 * Create new product - handles both JSON and FormData
 */
router.post("/products",
    requirePermission("manage_products"),
    conditionalMulter,
    (req, res) => productController.createProduct(req, res));

/**
 * Update product - handles both JSON and FormData
 */
router.put("/products/:id",
    requirePermission("manage_products"),
    conditionalMulter,
    (req, res) => productController.updateProduct(req, res));

/**
 * Delete product
 */
router.delete("/products/:id",
    requirePermission("manage_products"),
    (req, res) => productController.deleteProduct(req, res));

/**
 * Toggle product featured status
 */
router.put("/products/:id/featured",
    requirePermission("manage_products"),
    (req, res) => productController.toggleFeatured(req, res));

// ========================
// ORDER ROUTES
// ========================

/**
 * Get all orders with admin details
 */
router.get("/orders",
    requirePermission("manage_orders"),
    (req, res) => orderController.getOrders(req, res));

/**
 * Update order status
 */
router.put("/orders/:id/status",
    requirePermission("manage_orders"),
    (req, res) => orderController.updateOrderStatus(req, res));

// ========================
// USER ROUTES
// ========================

/**
 * Get all users
 */
router.get("/users",
    requirePermission("manage_users"),
    (req, res) => userController.getUsers(req, res));

/**
 * Update user status (enable/disable user)
 */
router.patch("/users/:userId/status",
    requirePermission("manage_users"),
    (req, res) => userController.updateUserStatus(req, res));

/**
 * Update user role
 */
router.patch("/users/:userId/role",
    requirePermission("manage_users"),
    (req, res) => userController.updateUserRole(req, res));

// ========================
// CONTENT ROUTES
// ========================

/**
 * Get website content/settings
 */
router.get("/content",
    requirePermission("manage_content"),
    (req, res) => contentController.getContent(req, res));

/**
 * Update website content/settings
 */
router.put("/content/:section",
    requirePermission("manage_content"),
    (req, res) => contentController.updateContent(req, res));

/**
 * Get admin settings
 */
router.get("/settings",
    requireAnyPermission(["manage_settings", "manage_admins"]),
    (req, res) => contentController.getSettings(req, res));

/**
 * Update admin settings
 */
router.put("/settings/:key",
    requirePermission("manage_settings"),
    (req, res) => contentController.updateSetting(req, res));

// ========================
// CONTACT MESSAGE ROUTES
// ========================

/**
 * Get all contact messages
 */
router.get("/contact-messages",
    requireAnyPermission(["manage_content", "view_analytics"]),
    (req, res) => contentController.getContactMessages(req, res));

/**
 * Get contact message statistics
 */
router.get("/contact-messages/stats",
    requireAnyPermission(["manage_content", "view_analytics"]),
    (req, res) => contentController.getContactMessageStats(req, res));

/**
 * Get a specific contact message
 */
router.get("/contact-messages/:id",
    requireAnyPermission(["manage_content", "view_analytics"]),
    (req, res) => contentController.getContactMessage(req, res));

/**
 * Mark contact message as read
 */
router.patch("/contact-messages/:id/read",
    requirePermission("manage_content"),
    (req, res) => contentController.markMessageAsRead(req, res));

/**
 * Mark contact message as replied and send email
 */
router.patch("/contact-messages/:id/reply",
    requirePermission("manage_content"),
    (req, res) => contentController.replyToMessage(req, res));

/**
 * Update contact message
 */
router.patch("/contact-messages/:id",
    requirePermission("manage_content"),
    (req, res) => contentController.updateContactMessage(req, res));

/**
 * Delete contact message
 */
router.delete("/contact-messages/:id",
    requirePermission("manage_content"),
    (req, res) => contentController.deleteContactMessage(req, res));

module.exports = router;
