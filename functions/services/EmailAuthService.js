const functions = require("firebase-functions");
const AuthService = require("./AuthService");
const TokenService = require("./TokenService");

/**
 * Email Authentication Service
 * Handles email/password authentication
 */
class EmailAuthService {
  /**
   * Initialize EmailAuthService
   */
  constructor() {
    this.authService = new AuthService();
    this.tokenService = new TokenService();
  }

  /**
   * Login with email and password
   * @param {Object} data - Login data {email, password}
   * @return {Promise<Object>} Authentication response
   */
  async login(data) {
    this.authService.validateRequiredFields(data, ["email", "password"]);

    const {email, password} = data;

    try {
      // Get Firebase API key from environment variables
      const firebaseApiKey = process.env.FB_API_KEY;

      if (!firebaseApiKey) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Firebase API key not configured",
        );
      }

      // Verify credentials using Firebase Auth REST API
      const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;
      const authResponse = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        const errorMessage = (authData.error && authData.error.message) ||
            "Authentication failed";
        throw new Error(errorMessage);
      }

      // Get user record from Admin SDK
      const userRecord = await this.authService.getUserByEmail(email);

      // Create authentication response with token
      return await this.tokenService.createAuthResponse(
          userRecord,
          this.authService,
      );
    } catch (error) {
      console.error("Email login error:", error);
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Invalid email or password",
      );
    }
  }

  /**
   * Register with email and password
   * @param {Object} data - Registration data {email, password, displayName}
   * @return {Promise<Object>} Authentication response
   */
  async register(data) {
    this.authService.validateRequiredFields(
        data,
        ["email", "password", "displayName"],
    );

    const {email, password, displayName} = data;

    try {
      // Create user with Admin SDK
      const userRecord = await this.authService.createUser({
        email: email,
        password: password,
        displayName: displayName,
        emailVerified: false,
      });

      // Set default role as customer
      await this.authService.setCustomUserClaims(userRecord.uid, {
        role: "customer",
      });

      // Create authentication response with token
      return await this.tokenService.createAuthResponse(
          userRecord,
          this.authService,
      );
    } catch (error) {
      console.error("Email registration error:", error);
      throw new functions.https.HttpsError(
          "internal",
          "Registration failed",
      );
    }
  }
}

module.exports = EmailAuthService;
