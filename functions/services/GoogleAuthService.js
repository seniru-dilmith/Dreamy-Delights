const functions = require("firebase-functions");
const {OAuth2Client} = require("google-auth-library");
const AuthService = require("./AuthService");
const TokenService = require("./TokenService");

/**
 * Google Authentication Service
 * Handles Google OAuth authentication
 */
class GoogleAuthService {
  /**
   * Initialize GoogleAuthService
   */
  constructor() {
    this.authService = new AuthService();
    this.tokenService = new TokenService();
  }

  /**
   * Verify Google ID token
   * @param {string} idToken - Google ID token
   * @return {Promise<Object>} Decoded token payload
   */
  async verifyGoogleToken(idToken) {
    // Try different ways to get Google Client ID for different environments
    const firebaseConfig = functions.config();
    const googleClientId =
      process.env.GOOGLE_CLIENT_ID || // Local .env
      (firebaseConfig.google && firebaseConfig.google.client_id) || // Firebase
      process.env.FIREBASE_GOOGLE_CLIENT_ID; // Alternative env var

    console.log("🔍 Google Client ID sources:");
    console.log("  - process.env.GOOGLE_CLIENT_ID:",
        !!process.env.GOOGLE_CLIENT_ID);
    console.log("  - functions.config().google:", !!(firebaseConfig.google));
    console.log("  - Final googleClientId:", !!googleClientId);

    if (!googleClientId) {
      console.log("❌ Google Client ID not available in any format");
      console.log("Available env vars:",
          Object.keys(process.env).filter((k) => k.includes("GOOGLE")));
      console.log("Firebase config:", firebaseConfig.google || "Not set");
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Google Client ID not configured",
      );
    }

    const client = new OAuth2Client(googleClientId);

    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      console.log("✅ Google token verified for user:", payload.email);

      return {
        uid: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
      };
    } catch (error) {
      console.error("❌ Failed to verify Google token:", error);
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Invalid Google ID token: " + error.message,
      );
    }
  }

  /**
   * Create or get user from Google auth data
   * @param {Object} decodedToken - Decoded Google token
   * @return {Promise<{userRecord: Object, isNewUser: boolean}>} User info
   */
  async createOrGetUser(decodedToken) {
    let userRecord;
    let isNewUser = false;

    try {
      console.log("🔍 Looking up user by email:", decodedToken.email);
      userRecord = await this.authService.getUserByEmail(decodedToken.email);
      console.log("✅ Existing user found:", {
        uid: userRecord.uid,
        email: userRecord.email,
      });
    } catch (error) {
      console.log("👤 User not found, creating new user for:",
          decodedToken.email);
      try {
        userRecord = await this.authService.createUser({
          email: decodedToken.email,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
          emailVerified: decodedToken.email_verified,
        });
        console.log("✅ New user created:", {
          uid: userRecord.uid,
          email: userRecord.email,
        });
        isNewUser = true;
      } catch (createError) {
        console.error("❌ Failed to create user:", createError);
        throw new functions.https.HttpsError(
            "internal",
            "Failed to create user: " + createError.message,
        );
      }
    }

    return {userRecord, isNewUser};
  }

  /**
   * Set default role for new Google users
   * @param {string} uid - User UID
   * @return {Promise<void>}
   */
  async setDefaultRole(uid) {
    console.log("🏷️ Setting role for new user");
    try {
      await this.authService.setCustomUserClaims(uid, {
        role: "customer",
      });
      console.log("✅ Role set successfully");
    } catch (roleError) {
      console.error("⚠️ Failed to set role:", roleError);
      // Don't fail the login for this
    }
  }

  /**
   * Login with Google OAuth
   * @param {Object} data - Login data {idToken}
   * @return {Promise<Object>} Authentication response
   */
  async login(data) {
    this.authService.validateRequiredFields(data, ["idToken"]);

    const {idToken} = data;

    try {
      // Verify Google ID token
      const decodedToken = await this.verifyGoogleToken(idToken);
      console.log("👤 Decoded token:", decodedToken);

      // Create or get user
      const {userRecord, isNewUser} = await this.createOrGetUser(decodedToken);

      // Set default role for new users
      if (isNewUser) {
        await this.setDefaultRole(userRecord.uid);
      }

      // Create authentication response with token
      const response = await this.tokenService.createAuthResponse(
          userRecord,
          this.authService,
      );

      console.log("🎉 Google login successful for:", userRecord.email);
      console.log("📤 Returning response:", {
        success: response.success,
        user: response.user,
        customTokenLength: response.customToken ?
            response.customToken.length : 0,
      });

      return response;
    } catch (error) {
      console.error("💥 Google login error:", error);
      console.error("💥 Error stack:", error.stack);

      // Re-throw HttpsError as-is, wrap others
      if (error.code && error.code.startsWith("functions/")) {
        throw error;
      }

      throw new functions.https.HttpsError(
          "internal",
          "Google authentication failed: " + error.message,
      );
    }
  }
}

module.exports = GoogleAuthService;
