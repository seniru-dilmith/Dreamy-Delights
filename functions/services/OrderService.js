const OrderModel = require("../models/Order");

/**
 * Order Service - Business logic for order operations
 */
class OrderService {
  /**
   * Initialize the Order Service
   */
  constructor() {
    this.orderModel = new OrderModel();
  }

  /**
   * Get all orders (admin only)
   * @return {Promise<Object>} Orders data with metadata
   */
  async getAllOrders() {
    const orders = await this.orderModel.getAll();

    return {
      success: true,
      data: orders,
      count: orders.length,
    };
  }

  /**
   * Get orders for a specific user
   * @param {string} userId - User ID
   * @return {Promise<Object>} User orders data
   */
  async getUserOrders(userId) {
    const orders = await this.orderModel.getByUserId(userId);

    return {
      success: true,
      data: orders,
    };
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data including userId
   * @return {Promise<Object>} Creation result with order ID
   */
  async createOrder(orderData) {
    // Validate required fields
    const {items, totalAmount, shippingAddress, userId} = orderData;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order items are required");
    }

    if (!totalAmount || totalAmount <= 0) {
      throw new Error("Valid total amount is required");
    }

    if (!shippingAddress) {
      throw new Error("Shipping address is required");
    }

    const result = await this.orderModel.create(orderData);

    return result;
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @return {Promise<Object>} Update result
   */
  async updateOrderStatus(orderId, status) {
    if (!orderId || !status) {
      throw new Error("Order ID and status are required");
    }

    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    await this.orderModel.updateStatus(orderId, status);

    return {
      success: true,
      message: "Order status updated successfully",
    };
  }
}

module.exports = OrderService;
