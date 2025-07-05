const UserService = require("../services/UserService");

/**
 * User Controller - Handles HTTP requests for user operations
 */
class UserController {
  /**
   * Initialize User Controller with User Service
   */
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Update user profile (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware
      const {name, email, phone, address} = req.body;

      const updateData = {
        name,
        email,
        phone,
        address,
      };

      await this.userService.updateProfile(userId, updateData);
      res.json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  }

  /**
   * Get user profile (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware
      const result = await this.userService.getProfile(userId);
      res.json(result);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch profile",
      });
    }
  }
}

module.exports = UserController;
