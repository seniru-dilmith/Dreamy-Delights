const functions = require("firebase-functions");
const admin = require("firebase-admin");

/**
 * Authentication middleware for Express routes
 * Verifies JWT tokens and adds user to request object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateUserMiddleware = async (req, res, next) => {
  try {
    const user = await authenticateUser(req);
    req.user = user; // Add user to request object
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Admin role verification middleware for Express routes
 * Checks if the authenticated user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdminMiddleware = async (req, res, next) => {
  try {
    const user = await requireAdmin(req);
    req.user = user; // Add user to request object
    next();
  } catch (error) {
    const statusCode = error.code === "permission-denied" ? 403 : 401;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Authentication middleware for Firebase Functions
 * Verifies JWT tokens and returns decoded user information
 * @param {Object} request - Express request object with Authorization header
 * @return {Promise<Object>} Decoded user token
 */
const authenticateUser = async (request) => {
  const authHeader = request.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "No valid authentication token provided",
    );
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Invalid authentication token",
    );
  }
};

/**
 * Admin role verification middleware
 * Checks if the authenticated user has admin role
 * @param {Object} request - Express request object with Authorization header
 * @return {Promise<Object>} Decoded user token with admin verification
 */
const requireAdmin = async (request) => {
  const user = await authenticateUser(request);

  // Check if user has admin role in Firestore
  const db = admin.firestore();
  const userDoc = await db.collection("users").doc(user.uid).get();
  const userData = userDoc.data();

  if (!userData || userData.role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Admin access required",
    );
  }

  return user;
};

/**
 * CORS headers helper for HTTP functions
 * Sets up proper CORS headers for cross-origin requests
 * @param {Object} res - Express response object
 */
const setCorsHeaders = (res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

/**
 * Admin role verification for callable functions
 * Used with Firebase callable functions (context-based)
 * @param {Object} context - Firebase callable function context
 * @return {Promise<Object>} Authenticated user context
 */
const requireAdminCallable = async (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
    );
  }

  // Check admin privileges using context.auth
  const db = admin.firestore();
  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  const userData = userDoc.data();

  if (!userData || userData.role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Admin access required",
    );
  }

  return context.auth;
};

module.exports = {
  authenticateUser,
  requireAdmin,
  setCorsHeaders,
  requireAdminCallable,
  authenticateUserMiddleware,
  requireAdminMiddleware,
};
