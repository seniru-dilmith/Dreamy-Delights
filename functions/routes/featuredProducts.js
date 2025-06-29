const express = require("express");
const FeaturedProductController =
  require("../controllers/FeaturedProductController");
const {requireAdminMiddleware} = require("../middleware/auth");

/**
 * Featured Product Routes - Express router for featured product endpoints
 */
// eslint-disable-next-line new-cap
const router = express.Router();
const featuredProductController = new FeaturedProductController();

// Public routes - no authentication required
router.get("/", (req, res) =>
  featuredProductController.getFeaturedProducts(req, res));
router.get("/:id", (req, res) =>
  featuredProductController.getFeaturedProductById(req, res));

// Admin routes - require admin authentication
router.post("/", requireAdminMiddleware, (req, res) =>
  featuredProductController.addFeaturedProduct(req, res));
router.put("/:id", requireAdminMiddleware, (req, res) =>
  featuredProductController.updateFeaturedProduct(req, res));
router.delete("/:id", requireAdminMiddleware, (req, res) =>
  featuredProductController.removeFeaturedProduct(req, res));

module.exports = router;
