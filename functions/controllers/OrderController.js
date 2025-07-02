const OrderService = require("../services/OrderService");

/**
 * Order Controller - Handles HTTP requests for order operations
 */
class OrderController {
  /**
   * Initialize Order Controller with Order Service
   */
  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Get all orders (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllOrders(req, res) {
    try {
      const result = await this.orderService.getAllOrders();
      res.json(result);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
      });
    }
  }

  /**
   * Get user orders (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware
      const result = await this.orderService.getUserOrders(userId);
      res.json(result);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
      });
    }
  }

  /**
   * Create a new order (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createOrder(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware
      const {
        items,
        totalAmount,
        shippingAddress,
        contactPhone,
        additionalNotes,
        customerInfo,
      } = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Order items are required",
        });
      }

      const orderData = {
        userId,
        items,
        totalAmount,
        shippingAddress,
        contactPhone,
        additionalNotes,
        customerInfo,
      };

      const result = await this.orderService.createOrder(orderData);
      res.json({
        success: true,
        orderId: result.id,
        message: "Order created successfully",
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create order",
      });
    }
  }

  /**
   * Update order status (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id || req.body.orderId;
      const {status} = req.body;

      if (!orderId || !status) {
        return res.status(400).json({
          success: false,
          error: "Order ID and status are required",
        });
      }

      await this.orderService.updateOrderStatus(orderId, status);
      res.json({
        success: true,
        message: "Order status updated successfully",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update order status",
      });
    }
  }
}

module.exports = OrderController;
