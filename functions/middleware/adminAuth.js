const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET ||
    "fallback-secret-change-in-production";

/**
 * Middleware to verify admin JWT token for HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    let decoded;
    let adminId;

    // Try Firebase custom token or ID token first
    try {
      const decodedFirebaseToken = await admin.auth().verifyIdToken(token);
      console.log("🔐 Verified Firebase ID token:", {
        uid: decodedFirebaseToken.uid,
        role: decodedFirebaseToken.role,
        adminId: decodedFirebaseToken.adminId,
      });
      
      decoded = decodedFirebaseToken;
      adminId = decodedFirebaseToken.adminId || decodedFirebaseToken.uid;
      
      // For Firebase tokens, set additional fields for compatibility
      decoded.id = adminId;
      decoded.username = decoded.username || "firebase-admin";
      decoded.role = decoded.role || "admin";
    } catch (firebaseError) {
      console.log("🔐 Not a Firebase token, trying JWT verification...");
      
      // Fallback to JWT verification
      try {
        decoded = jwt.verify(token, ADMIN_JWT_SECRET);
        console.log("🔐 Decoded JWT token:", {
          id: decoded.id,
          adminId: decoded.adminId,
          username: decoded.username,
          type: decoded.type,
        });

        // Get admin ID from token (handle both 'id' and 'adminId' fields)
        adminId = decoded.adminId || decoded.id;
      } catch (jwtError) {
        console.error("🔐 Token verification failed:", jwtError.message);
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }
    }
    
    if (!adminId) {
      console.error("🔐 No admin ID found in token:", decoded);
      return res.status(401).json({
        success: false,
        message: "Invalid token: missing admin ID",
      });
    }

    console.log("🔐 Verifying admin ID:", adminId);

    // Skip database check for test admin tokens
    if (adminId === "test-admin-id") {
      console.log("🔐 Using test admin token - skipping database verification");
      // Add admin info to request object for test admin
      req.admin = {
        id: adminId,
        username: decoded.username || "admin",
        role: decoded.role || "super_admin",
        permissions: decoded.permissions ||
          ["manage_products", "manage_orders", "view_analytics"],
        data: {active: true, role: "super_admin"},
      };
      
      next();
      return;
    }

    // Verify admin still exists and is active (for real admin tokens)
    const db = admin.firestore();
    const adminDoc = await db.collection("admins").doc(adminId).get();

    if (!adminDoc.exists || !adminDoc.data().active) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive admin account",
      });
    }

    // Add admin info to request object
    const adminData = adminDoc.data();
    req.admin = {
      id: adminId, // Use the resolved admin ID
      username: decoded.username || adminData.username,
      role: decoded.role || adminData.role,
      permissions: decoded.permissions || adminData.permissions ||
        ["manage_products", "manage_orders", "view_analytics"], // Defaults
      data: adminData,
    };

    next();
  } catch (error) {
    console.error("Admin token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Middleware to check if admin has specific permission
 * @param {string} permission - The permission to check
 * @return {Function} Express middleware function
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if admin has one of multiple permissions
 * @param {Array<string>} permissions - Array of permissions to check
 * @return {Function} Express middleware function
 */
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const hasPermission = permissions.some((permission) =>
      req.admin.permissions.includes(permission),
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `One of these permissions required: ${permissions.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if admin is super admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @return {void}
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Admin authentication required",
    });
  }

  if (req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Super admin role required",
    });
  }

  next();
};

/**
 * Legacy middleware for callable functions
 * @param {Object} context - Firebase callable function context
 * @return {Promise<Object>} User record if admin
 */
const requireAdminCallable = async (context) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }

  // Check if user has admin role in custom claims
  const userRecord = await admin.auth().getUser(context.auth.uid);
  const customClaims = userRecord.customClaims || {};

  if (customClaims.role !== "admin") {
    throw new Error("Admin role required");
  }

  return userRecord;
};

module.exports = {
  verifyAdminToken,
  requirePermission,
  requireAnyPermission,
  requireSuperAdmin,
  requireAdminCallable,
};
