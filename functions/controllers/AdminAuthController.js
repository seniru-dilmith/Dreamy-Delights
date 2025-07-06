const AdminAuthService = require("../services/AdminAuthService");

/**
 * Admin Auth Controller - Handles admin authentication requests
 */
class AdminAuthController {
  /**
   * Constructor for AdminAuthController
   */
  constructor() {
    this.authService = new AdminAuthService();
  }

  /**
   * Admin login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const {username, password} = req.body;
      const result = await this.authService.login(username, password);

      res.json(result);
    } catch (error) {
      console.error("🔐 Admin HTTP login error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Login failed",
        error: error.message,
      });
    }
  }
}

module.exports = AdminAuthController;
