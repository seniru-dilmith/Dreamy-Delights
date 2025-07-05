const admin = require("firebase-admin");

/**
 * User Model - Handles all user-related database operations
 */
class UserModel {
  /**
   * Initialize the User Model
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
   * Get users collection
   * @return {Object} Firestore collection
   */
  get collection() {
    if (!this._collection) {
      this._collection = this.db.collection("users");
    }
    return this._collection;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @return {Promise<Object|null>} User data or null if not found
   */
  async getById(userId) {
    const doc = await this.collection.doc(userId).get();
    return doc.exists ? doc.data() : null;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @return {Promise<void>}
   */
  async updateProfile(userId, profileData) {
    const data = {
      ...profileData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await this.collection.doc(userId).set(data, {merge: true});
  }

  /**
   * Check if user has admin role
   * @param {string} userId - User ID
   * @return {Promise<boolean>} True if user is admin
   */
  async isAdmin(userId) {
    const userData = await this.getById(userId);
    return userData && userData.role === "admin";
  }
}

module.exports = UserModel;
