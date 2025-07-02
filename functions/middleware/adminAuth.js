const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

// Use the same secret as configured in functions.config()
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET ||
    "your-super-secure-jwt-secret-change-this-in-production";

/**
 * Middleware to verify admin JWT token for HTTP requests
 * This middleware exclusively uses the 'admins' collection
 * and does not rely on Firebase Auth
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

    // Decode and verify the JWT token
    try {
      decoded = jwt.verify(token, ADMIN_JWT_SECRET);
      console.log("🔐 Decoded JWT token:", {
        id: decoded.id,
        username: decoded.username,
        type: decoded.type,
      });

      // Get admin ID from token
      adminId = decoded.id;
    } catch (jwtError) {
      console.error("🔐 Token verification failed:", jwtError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
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
      // Normalize permissions for test admin tokens
      let perms = [];
      if (decoded.permissions) {
        perms = decoded.permissions;
      } else {
        perms = [
          "manage_products",
          "manage_orders",
          "view_analytics",
        ];
      }
      if (!Array.isArray(perms)) {
        perms = Object.keys(perms);
      }
      req.admin = {
        id: adminId,
        username: decoded.username || "admin",
        role: decoded.role || "super_admin",
        permissions: perms,
        data: {active: true, role: "super_admin"},
      };
      next();
      return;
    }

    // Verify admin still exists and is active
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
    // Normalize permissions to an array for consistency
    let perms;
    if (decoded.permissions != null) {
      perms = decoded.permissions;
    } else if (adminData.permissions != null) {
      perms = adminData.permissions;
    } else {
      perms = [];
    }
    if (!Array.isArray(perms)) {
      // If permissions stored as object map, extract keys
      perms = Object.keys(perms);
    }
    req.admin = {
      id: adminId,
      username: decoded.username || adminData.username,
      role: decoded.role || adminData.role,
      permissions: perms,
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

module.exports = {
  verifyAdminToken,
  requirePermission,
  requireAnyPermission,
  requireSuperAdmin,
};
