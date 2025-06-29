const UserModel = require("../models/User");

/**
 * User Service - Business logic for user operations
 */
class UserService {
  /**
   * Initialize the User Service
   */
  constructor() {
    this.userModel = new UserModel();
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @return {Promise<Object>} Update result
   */
  async updateProfile(userId, updateData) {
    const result = await this.userModel.update(userId, updateData);
    return result;
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @return {Promise<Object>} User profile data
   */
  async getProfile(userId) {
    const user = await this.userModel.getById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      data: user,
    };
  }

  /**
   * Create user profile
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   * @return {Promise<Object>} Creation result
   */
  async createProfile(userId, userData) {
    const result = await this.userModel.create(userId, userData);
    return result;
  }
}

module.exports = UserService;
