const AdminDashboardService = require("../services/AdminDashboardService");

/**
 * Admin Dashboard Controller - Handles dashboard and analytics requests
 */
class AdminDashboardController {
  /**
   * Constructor for AdminDashboardController
   */
  constructor() {
    this.dashboardService = new AdminDashboardService();
  }

  /**
   * Get dashboard statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDashboardStats(req, res) {
    try {
      const stats = await this.dashboardService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch dashboard statistics",
      });
    }
  }

  /**
   * Get analytics data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAnalytics(req, res) {
    try {
      const analytics = await this.dashboardService.getAnalyticsData();

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch analytics",
      });
    }
  }
}

module.exports = AdminDashboardController;
