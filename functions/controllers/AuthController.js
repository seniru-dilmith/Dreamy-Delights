const functions = require("firebase-functions");
const AuthService = require("../services/AuthService");
const EmailAuthService = require("../services/EmailAuthService");
const GoogleAuthService = require("../services/GoogleAuthService");
const TokenService = require("../services/TokenService");

/**
 * Authentication Controller
 * Handles Firebase Cloud Functions for authentication
 */
class AuthController {
  /**
   * Initialize AuthController
   */
  constructor() {
    this.authService = new AuthService();
    this.emailAuthService = new EmailAuthService();
    this.googleAuthService = new GoogleAuthService();
    this.tokenService = new TokenService();
  }

  /**
   * Extract actual data from Firebase function call
   * @param {Object} data - Function call data
   * @return {Object} Extracted data
   */
  extractData(data) {
    // The data might be nested differently in 2nd gen functions
    let actualData = data;
    if (data.data) {
      actualData = data.data;
    }
    return actualData;
  }

  /**
   * Login with email and password
   * @return {functions.https.HttpsFunction} Firebase function
   */
  getLoginWithEmail() {
    return functions.https.onCall(async (data, context) => {
      console.log("loginWithEmail called with data:", data);
      const actualData = this.extractData(data);
      console.log("Using data:", JSON.stringify(actualData, null, 2));

      return await this.emailAuthService.login(actualData);
    });
  }

  /**
   * Register with email and password
   * @return {functions.https.HttpsFunction} Firebase function
   */
  getRegisterWithEmail() {
    return functions.https.onCall(async (data, context) => {
      console.log("registerWithEmail called");
      const actualData = this.extractData(data);
      console.log("Extracted data keys:", Object.keys(actualData));

      return await this.emailAuthService.register(actualData);
    });
  }

  /**
   * Login with Google OAuth
   * @return {functions.https.HttpsFunction} Firebase function
   */
  getLoginWithGoogle() {
    return functions.https.onCall(async (data, context) => {
      console.log("🚀 loginWithGoogle called");
      const actualData = this.extractData(data);
      console.log("📝 Extracted data keys:", Object.keys(actualData));

      return await this.googleAuthService.login(actualData);
    });
  }

  /**
   * Get current user info
   * @return {functions.https.HttpsFunction} Firebase function
   */
  getGetCurrentUser() {
    return functions.https.onCall(async (data, context) => {
      if (!context.auth) {
        return {user: null};
      }

      try {
        const userRecord = await this.authService.getUserByUid(
            context.auth.uid,
        );

        return {
          user: this.authService.formatUserResponse(userRecord),
        };
      } catch (error) {
        console.error("Get current user error:", error);
        return {user: null};
      }
    });
  }

  /**
   * Logout user
   * @return {functions.https.HttpsFunction} Firebase function
   */
  getLogout() {
    return functions.https.onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User must be authenticated",
        );
      }

      try {
        await this.authService.revokeRefreshTokens(context.auth.uid);
        return {success: true};
      } catch (error) {
        console.error("Logout error:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Logout failed",
        );
      }
    });
  }

  /**
   * Refresh user token
   * @return {functions.https.HttpsFunction} Firebase function
   */
  getRefreshToken() {
    return functions.https.onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User must be authenticated",
        );
      }

      try {
        const customToken = await this.tokenService.createCustomToken(
            context.auth.uid,
        );

        return {
          success: true,
          customToken,
        };
      } catch (error) {
        console.error("Token refresh error:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Token refresh failed",
        );
      }
    });
  }

  /**
   * Set user role (admin only)
   * @return {functions.https.HttpsFunction} Firebase function
   */
  getSetUserRole() {
    return functions.https.onCall(async (data, context) => {
      // Check if user is authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User must be authenticated",
        );
      }

      const {uid, role} = data;

      if (!uid || !role) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "User ID and role are required",
        );
      }

      // Valid roles
      const validRoles = ["customer", "admin"];
      if (!validRoles.includes(role)) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Invalid role. Must be 'customer' or 'admin'",
        );
      }

      try {
        // Validate admin role
        await this.authService.validateAdminRole(context.auth.uid);

        // Set the custom claims for the target user
        await this.authService.setCustomUserClaims(uid, {role: role});

        return {
          success: true,
          message: `User role updated to ${role}`,
        };
      } catch (error) {
        console.error("Set user role error:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Failed to set user role",
        );
      }
    });
  }
}

module.exports = AuthController;
