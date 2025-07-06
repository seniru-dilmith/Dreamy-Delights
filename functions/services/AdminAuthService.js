const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Admin Auth Service - Handles admin authentication
 */
class AdminAuthService {
  /**
   * Constructor for AdminAuthService
   */
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Admin login
   * @param {string} username - Username
   * @param {string} password - Password
   * @return {Object} Login result with token and admin data
   */
  async login(username, password) {
    try {
      console.log("🔐 Admin login attempt:", username);

      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      // Check against Firestore admins collection
      const adminSnapshot = await this.db.collection("admins")
          .where("username", "==", username)
          .limit(1)
          .get();

      if (adminSnapshot.empty) {
        console.log("🔐 Admin not found:", username);
        throw new Error("Invalid credentials");
      }

      const adminDoc = adminSnapshot.docs[0];
      const adminData = adminDoc.data();

      // Check if admin is active
      if (!adminData.active) {
        console.log("🔐 Admin account disabled:", username);
        throw new Error("Account disabled");
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password,
          adminData.hashedPassword);

      if (!passwordMatch) {
        console.log("🔐 Invalid password for:", username);
        throw new Error("Invalid credentials");
      }

      // Update last login
      await adminDoc.ref.update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Validate JWT secret before token creation
      const jwtSecret = process.env.ADMIN_JWT_SECRET;
      if (!jwtSecret) {
        console.error("❌ ADMIN_JWT_SECRET not configured");
        throw new Error("Server configuration error");
      }

      // Generate JWT token
      const permissionsArray = Object.entries(adminData.permissions || {})
          .filter(([key, value]) => value === true)
          .map(([key]) => key);

      const token = jwt.sign(
          {
            id: adminDoc.id,
            username: adminData.username,
            role: adminData.role,
            permissions: permissionsArray,
            type: "admin",
          },
          jwtSecret,
          {expiresIn: "24h"},
      );

      console.log("🔐 Admin login successful:", username);

      return {
        success: true,
        token,
        admin: {
          id: adminDoc.id,
          username: adminData.username,
          email: adminData.email,
          role: adminData.role,
          permissions: permissionsArray,
        },
        message: "Admin login successful",
      };
    } catch (error) {
      console.error("🔐 Admin login error:", error);
      throw error;
    }
  }
}

module.exports = AdminAuthService;
