const admin = require("firebase-admin");

/**
 * Admin Order Service - Handles order management operations
 */
class AdminOrderService {
  /**
   * Constructor for AdminOrderService
   */
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Get all orders
   * @return {Array} Array of orders
   */
  async getAllOrders() {
    try {
      const snapshot = await this.db.collection("orders")
          .orderBy("createdAt", "desc")
          .get();

      const orders = [];
      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new Error("Failed to fetch orders");
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @param {string} adminId - Admin ID who updated the order
   * @return {boolean} Success status
   */
  async updateOrderStatus(orderId, status, adminId) {
    try {
      if (!status) {
        throw new Error("Status is required");
      }

      const orderRef = this.db.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        throw new Error("Order not found");
      }

      await orderRef.update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: adminId,
      });

      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }
}

module.exports = AdminOrderService;
