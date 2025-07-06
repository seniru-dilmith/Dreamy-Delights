const express = require("express");
const {requireAnyPermission} = require("../../middleware/adminAuth");
const AdminDashboardController =
  require("../../controllers/AdminDashboardController");

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Get dashboard statistics
 */
router.get("/stats",
    requireAnyPermission(["view_analytics", "manage_products",
      "manage_orders"]),
    (req, res) => {
      const dashboardController = new AdminDashboardController();
      dashboardController.getDashboardStats(req, res);
    });

/**
 * Get analytics data
 */
router.get("/analytics",
    requireAnyPermission(["view_analytics"]),
    (req, res) => {
      const dashboardController = new AdminDashboardController();
      dashboardController.getAnalytics(req, res);
    });

module.exports = router;
