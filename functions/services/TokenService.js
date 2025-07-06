const admin = require("firebase-admin");

/**
 * Token Service
 * Handles token creation and management
 */
class TokenService {
  /**
   * Create custom token for user
   * @param {string} uid - User UID
   * @return {Promise<string>} Custom token
   */
  async createCustomToken(uid) {
    try {
      return await admin.auth().createCustomToken(uid);
    } catch (error) {
      throw new Error(`Failed to create custom token: ${error.message}`);
    }
  }

  /**
   * Verify Firebase ID token
   * @param {string} idToken - ID token to verify
   * @return {Promise<Object>} Decoded token
   */
  async verifyIdToken(idToken) {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Create authentication response with token
   * @param {Object} userRecord - User record
   * @param {Object} authService - Auth service instance
   * @return {Promise<Object>} Authentication response
   */
  async createAuthResponse(userRecord, authService) {
    const customToken = await this.createCustomToken(userRecord.uid);

    return {
      success: true,
      user: authService.formatUserResponse(userRecord),
      customToken,
    };
  }
}

module.exports = TokenService;
