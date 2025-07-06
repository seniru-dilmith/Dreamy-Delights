const admin = require("firebase-admin");
const functions = require("firebase-functions");

/**
 * Core Authentication Service
 * Handles common authentication operations
 */
class AuthService {
  /**
   * Get user by email
   * @param {string} email - User email
   * @return {Promise<Object>} User record
   */
  async getUserByEmail(email) {
    try {
      return await admin.auth().getUserByEmail(email);
    } catch (error) {
      throw new Error(`User not found: ${error.message}`);
    }
  }

  /**
   * Get user by UID
   * @param {string} uid - User UID
   * @return {Promise<Object>} User record
   */
  async getUserByUid(uid) {
    try {
      return await admin.auth().getUser(uid);
    } catch (error) {
      throw new Error(`User not found: ${error.message}`);
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @return {Promise<Object>} User record
   */
  async createUser(userData) {
    try {
      return await admin.auth().createUser(userData);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Set custom user claims (roles)
   * @param {string} uid - User UID
   * @param {Object} claims - Custom claims
   * @return {Promise<void>}
   */
  async setCustomUserClaims(uid, claims) {
    try {
      await admin.auth().setCustomUserClaims(uid, claims);
    } catch (error) {
      throw new Error(`Failed to set user claims: ${error.message}`);
    }
  }

  /**
   * Get user role from custom claims
   * @param {Object} userRecord - User record
   * @return {string} User role
   */
  getUserRole(userRecord) {
    return (userRecord.customClaims &&
        userRecord.customClaims.role) || "customer";
  }

  /**
   * Format user response object
   * @param {Object} userRecord - User record
   * @return {Object} Formatted user object
   */
  formatUserResponse(userRecord) {
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      role: this.getUserRole(userRecord),
    };
  }

  /**
   * Validate required fields
   * @param {Object} data - Data to validate
   * @param {Array<string>} requiredFields - Required field names
   * @throws {functions.https.HttpsError} If validation fails
   */
  validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          `Missing required fields: ${missingFields.join(", ")}`,
      );
    }
  }

  /**
   * Validate user role for admin operations
   * @param {string} uid - Current user UID
   * @throws {functions.https.HttpsError} If user is not admin
   */
  async validateAdminRole(uid) {
    const userRecord = await this.getUserByUid(uid);
    const userRole = this.getUserRole(userRecord);

    if (userRole !== "admin") {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Only admins can perform this operation",
      );
    }
  }

  /**
   * Revoke refresh tokens for user
   * @param {string} uid - User UID
   * @return {Promise<void>}
   */
  async revokeRefreshTokens(uid) {
    try {
      await admin.auth().revokeRefreshTokens(uid);
    } catch (error) {
      throw new Error(`Failed to revoke tokens: ${error.message}`);
    }
  }
}

module.exports = AuthService;
