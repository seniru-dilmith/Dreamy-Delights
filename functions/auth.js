const AuthController = require("./controllers/AuthController");

/**
 * Refactored Authentication Functions
 *
 * This file has been refactored for better maintainability and readability.
 * The authentication logic has been split into:
 *
 * Services:
 * - AuthService: Core authentication operations
 * - EmailAuthService: Email/password authentication
 * - GoogleAuthService: Google OAuth authentication
 * - TokenService: Token management
 *
 * Controllers:
 * - AuthController: Firebase Cloud Functions handlers
 *
 * Admin authentication functions have been moved to HTTP endpoints
 * in routes/admin.js to prevent CORS issues.
 */

// Initialize the controller
const authController = new AuthController();

// Export authentication functions
exports.loginWithEmail = authController.getLoginWithEmail();
exports.registerWithEmail = authController.getRegisterWithEmail();
exports.loginWithGoogle = authController.getLoginWithGoogle();
exports.getCurrentUser = authController.getGetCurrentUser();
exports.logout = authController.getLogout();
exports.refreshToken = authController.getRefreshToken();
exports.setUserRole = authController.getSetUserRole();
