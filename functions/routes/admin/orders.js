const express = require("express");
const {requirePermission} = require("../../middleware/adminAuth");
const AdminOrderController = require("../../controllers/AdminOrderController");

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Get all orders with admin details
 */
router.get("/",
    requirePermission("manage_orders"),
    (req, res) => {
      const orderController = new AdminOrderController();
      orderController.getOrders(req, res);
    });

/**
 * Update order status
 */
router.put("/:id/status",
    requirePermission("manage_orders"),
    (req, res) => {
      const orderController = new AdminOrderController();
      orderController.updateOrderStatus(req, res);
    });

module.exports = router;
