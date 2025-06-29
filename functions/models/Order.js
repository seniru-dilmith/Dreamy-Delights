const admin = require("firebase-admin");

/**
 * Order Model - Handles all order-related database operations
 */
class OrderModel {
  /**
   * Initialize the Order Model
   */
  constructor() {
    // Lazy-load Firestore to avoid initialization issues
    this._db = null;
    this._collection = null;
  }

  /**
   * Get Firestore database instance
   * @return {Object} Firestore database
   */
  get db() {
    if (!this._db) {
      this._db = admin.firestore();
    }
    return this._db;
  }

  /**
   * Get orders collection
   * @return {Object} Firestore collection
   */
  get collection() {
    if (!this._collection) {
      this._collection = this.db.collection("orders");
    }
    return this._collection;
  }

  /**
   * Get all orders (admin only)
   * @return {Promise<Array>} Array of orders
   */
  async getAll() {
    const snapshot = await this.collection
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
  }

  /**
   * Get orders by user ID
   * @param {string} userId - User ID
   * @return {Promise<Array>} Array of user orders
   */
  async getByUserId(userId) {
    const snapshot = await this.collection
        .where("userId", "==", userId)
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
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data including userId
   * @return {Promise<Object>} Result with order ID
   */
  async create(orderData) {
    const data = {
      ...orderData,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(data);
    return {id: docRef.id};
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @return {Promise<void>}
   */
  async updateStatus(orderId, status) {
    await this.collection.doc(orderId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

module.exports = OrderModel;
