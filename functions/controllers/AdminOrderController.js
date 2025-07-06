const AdminOrderService = require("../services/AdminOrderService");

/**
 * Admin Order Controller - Handles order management requests
 */
class AdminOrderController {
  /**
   * Constructor for AdminOrderController
   */
  constructor() {
    this.orderService = new AdminOrderService();
  }

  /**
   * Get all orders
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrders(req, res) {
    try {
      const orders = await this.orderService.getAllOrders();

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch orders",
      });
    }
  }

  /**
   * Update order status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateOrderStatus(req, res) {
    try {
      const {id} = req.params;
      const {status} = req.body;

      await this.orderService.updateOrderStatus(id, status, req.admin.id);

      res.json({
        success: true,
        message: "Order status updated successfully",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update order status",
      });
    }
  }
}

module.exports = AdminOrderController;
