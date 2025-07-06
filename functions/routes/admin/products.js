const express = require("express");
const multer = require("multer");
const {requirePermission} = require("../../middleware/adminAuth");
const AdminProductController =
  require("../../controllers/AdminProductController");

// eslint-disable-next-line new-cap
const router = express.Router();

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

/**
 * Get all products with admin details
 */
router.get("/",
    requirePermission("manage_products"),
    (req, res) => {
      const productController = new AdminProductController();
      productController.getProducts(req, res);
    });

/**
 * Create new product - handles both JSON and FormData
 */
router.post("/",
    requirePermission("manage_products"),
    conditionalMulter,
    (req, res) => {
      const productController = new AdminProductController();
      productController.createProduct(req, res);
    });

/**
 * Update product - handles both JSON and FormData
 */
router.put("/:id",
    requirePermission("manage_products"),
    conditionalMulter,
    (req, res) => {
      const productController = new AdminProductController();
      productController.updateProduct(req, res);
    });

/**
 * Delete product
 */
router.delete("/:id",
    requirePermission("manage_products"),
    (req, res) => {
      const productController = new AdminProductController();
      productController.deleteProduct(req, res);
    });

/**
 * Toggle product featured status
 */
router.put("/:id/featured",
    requirePermission("manage_products"),
    (req, res) => {
      const productController = new AdminProductController();
      productController.toggleFeatured(req, res);
    });

module.exports = router;
