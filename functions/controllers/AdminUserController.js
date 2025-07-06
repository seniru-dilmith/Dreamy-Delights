const AdminUserService = require("../services/AdminUserService");

/**
 * Admin User Controller - Handles user management requests
 */
class AdminUserController {
  /**
   * Constructor for AdminUserController
   */
  constructor() {
    this.userService = new AdminUserService();
  }

  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUsers(req, res) {
    try {
      const users = await this.userService.getAllUsers();

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch users",
      });
    }
  }

  /**
   * Update user status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUserStatus(req, res) {
    try {
      const {userId} = req.params;
      const {status} = req.body;

      await this.userService.updateUserStatus(userId, status);

      res.json({
        success: true,
        message: `User ${status === "banned" ? "disabled" : "enabled"}` +
          " successfully",
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update user status",
      });
    }
  }

  /**
   * Update user role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUserRole(req, res) {
    try {
      const {userId} = req.params;
      const {role} = req.body;

      await this.userService.updateUserRole(userId, role);

      res.json({
        success: true,
        message: "User role updated successfully",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update user role",
      });
    }
  }
}

module.exports = AdminUserController;
