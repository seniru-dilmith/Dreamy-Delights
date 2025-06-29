const express = require("express");
const OrderController = require("../controllers/OrderController");
const {
  requireAdminMiddleware,
  authenticateUserMiddleware,
} = require("../middleware/auth");

/**
 * Order Routes - Express router for order-related endpoints
 */
// eslint-disable-next-line new-cap
const router = express.Router();
const orderController = new OrderController();

// User routes - require authentication
router.get("/user", authenticateUserMiddleware, (req, res) =>
  orderController.getUserOrders(req, res));
router.post("/", authenticateUserMiddleware, (req, res) =>
  orderController.createOrder(req, res));

// Admin routes - require admin authentication
router.get("/all", requireAdminMiddleware, (req, res) =>
  orderController.getAllOrders(req, res));
router.put("/:id/status", requireAdminMiddleware, (req, res) =>
  orderController.updateOrderStatus(req, res));

module.exports = router;
