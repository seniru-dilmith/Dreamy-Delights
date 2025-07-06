const admin = require("firebase-admin");

/**
 * Admin Dashboard Service - Handles dashboard statistics and analytics
 */
class AdminDashboardService {
  /**
   * Constructor for AdminDashboardService
   */
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Get dashboard statistics
   * @return {Object} Dashboard statistics
   */
  async getDashboardStats() {
    try {
      // Get products count
      const productsSnapshot = await this.db.collection("products").get();
      const totalProducts = productsSnapshot.size;

      // Get orders count and revenue
      const ordersSnapshot = await this.db.collection("orders").get();
      const totalOrders = ordersSnapshot.size;

      let totalRevenue = 0;
      let pendingOrders = 0;
      let recentOrders = 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        if (orderData.totalAmount) {
          totalRevenue += orderData.totalAmount;
        }
        if (orderData.status === "pending") {
          pendingOrders++;
        }
        if (orderData.createdAt &&
            orderData.createdAt.toDate() > thirtyDaysAgo) {
          recentOrders++;
        }
      });

      // Get users count
      const usersSnapshot = await this.db.collection("users").get();
      const totalUsers = usersSnapshot.size;

      const averageOrderValue = totalOrders > 0 ?
        parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

      return {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        recentOrders,
        pendingOrders,
        averageOrderValue,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw new Error("Failed to fetch dashboard statistics");
    }
  }

  /**
   * Get analytics data
   * @return {Object} Analytics data
   */
  async getAnalyticsData() {
    try {
      // Get basic counts
      const [productsCount, ordersCount, usersCount] = await Promise.all([
        this.db.collection("products").get().then((snapshot) => snapshot.size),
        this.db.collection("orders").get().then((snapshot) => snapshot.size),
        this.db.collection("users").get().then((snapshot) => snapshot.size),
      ]);

      // Get recent orders for revenue calculation
      const recentOrders = await this.db.collection("orders")
          .where("createdAt", ">=", new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
          ))
          .get();

      let monthlyRevenue = 0;
      recentOrders.forEach((doc) => {
        const order = doc.data();
        if (order.totalAmount) {
          monthlyRevenue += order.totalAmount;
        }
      });

      return {
        productsCount,
        ordersCount,
        usersCount,
        monthlyRevenue,
        recentOrdersCount: recentOrders.size,
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw new Error("Failed to fetch analytics");
    }
  }
}

module.exports = AdminDashboardService;
