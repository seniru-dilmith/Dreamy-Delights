const express = require("express");
const ProductController = require("../controllers/ProductController");
const {requireAdminMiddleware} = require("../middleware/auth");

/**
 * Product Routes - Express router for product-related endpoints
 */
// eslint-disable-next-line new-cap
const router = express.Router();
const productController = new ProductController();

// Public routes - no authentication required
router.get("/", (req, res) => productController.getProducts(req, res));

// Admin routes - require admin authentication
router.post("/", requireAdminMiddleware, (req, res) =>
  productController.createProduct(req, res));
router.put("/:id", requireAdminMiddleware, (req, res) =>
  productController.updateProduct(req, res));
router.delete("/:id", requireAdminMiddleware, (req, res) =>
  productController.deleteProduct(req, res));

module.exports = router;
