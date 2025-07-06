const admin = require("firebase-admin");

/**
 * Admin User Service - Handles user management operations
 */
class AdminUserService {
  /**
   * Constructor for AdminUserService
   */
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Get all users with detailed information
   * @return {Array} Array of users
   */
  async getAllUsers() {
    try {
      // Fetch users from Firebase Authentication
      const listUsersResult = await admin.auth().listUsers();
      const authUsers = listUsersResult.users;

      // Get all admins from the admins collection for quick lookup
      const adminsSnapshot = await this.db.collection("admins").get();
      const adminsMap = new Map();

      adminsSnapshot.forEach((doc) => {
        const adminData = doc.data();
        // Store with uid as key for easy lookup
        if (adminData.uid) {
          adminsMap.set(adminData.uid, {
            ...adminData,
            id: doc.id,
            isInAdminsCollection: true,
          });
        } else if (adminData.email) {
          // Also create an email-based lookup in case we need it
          adminsMap.set(adminData.email.toLowerCase(), {
            ...adminData,
            id: doc.id,
            isInAdminsCollection: true,
          });
        }
      });

      console.log(`Found ${adminsMap.size} admins in admins collection`);

      const users = [];

      for (const authUser of authUsers) {
        // Check if this user is in the admins collection
        const adminData = authUser.email ?
            adminsMap.get(authUser.uid) ||
            adminsMap.get(authUser.email.toLowerCase()) :
            adminsMap.get(authUser.uid);

        // Get regular user data from users collection if not an admin
        let firestoreData = {};
        if (!adminData) {
          try {
            const userDoc = await this.db.collection("users")
                .doc(authUser.uid).get();
            if (userDoc.exists) {
              firestoreData = userDoc.data();
            }
          } catch (firestoreError) {
            console.log(`No Firestore data for user ${authUser.uid}`);
          }
        }

        // Get custom claims (role information)
        const customClaims = authUser.customClaims || {};

        // Determine name from various sources
        let displayName = authUser.displayName;
        if (!displayName && adminData) {
          displayName = adminData.displayName || adminData.username;
        }
        if (!displayName) {
          displayName = firestoreData.displayName ||
                      firestoreData.name ||
                      "No Name";
        }

        // Determine role
        let userRole = customClaims.role;
        if (!userRole && adminData) {
          userRole = adminData.role;
        }
        if (!userRole) {
          userRole = firestoreData.role || "customer";
        }

        // Determine status
        let userStatus = "active";
        if (authUser.disabled) {
          userStatus = "banned";
        } else if (adminData) {
          userStatus = adminData.active ? "active" : "banned";
        } else if (firestoreData.status) {
          userStatus = firestoreData.status;
        }

        // Determine dates
        let joinDate = authUser.metadata.creationTime;
        if (!joinDate && adminData && adminData.createdAt) {
          joinDate = adminData.createdAt;
        }
        if (!joinDate) {
          joinDate = new Date().toISOString();
        }

        let lastLogin = authUser.metadata.lastSignInTime;
        if (!lastLogin && adminData && adminData.lastLogin) {
          lastLogin = adminData.lastLogin;
        }
        if (!lastLogin) {
          lastLogin = authUser.metadata.creationTime ||
                    new Date().toISOString();
        }

        users.push({
          id: authUser.uid,
          name: displayName,
          email: authUser.email ||
                (adminData ? adminData.email : null) ||
                "No email",
          role: userRole,
          status: userStatus,
          joinDate: joinDate,
          lastLogin: lastLogin,
          totalOrders: firestoreData.totalOrders || 0,
          totalSpent: firestoreData.totalSpent || 0,
          emailVerified: authUser.emailVerified,
          providerId: authUser.providerData.map((p) => p.providerId),
          photoURL: authUser.photoURL,
          phoneNumber: authUser.phoneNumber,
          // Add info about which collection this user belongs to
          isAdmin: !!adminData,
          adminId: adminData ? adminData.id : null,
        });
      }

      // Sort by creation time (newest first)
      users.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  /**
   * Update user status (enable/disable)
   * @param {string} userId - User ID
   * @param {string} status - Status (active/banned)
   * @return {boolean} Success status
   */
  async updateUserStatus(userId, status) {
    try {
      if (!["active", "banned"].includes(status)) {
        throw new Error("Invalid status. Must be 'active' or 'banned'");
      }

      // Update Firebase Auth user
      await admin.auth().updateUser(userId, {
        disabled: status === "banned",
      });

      // Check if this is an admin in the admins collection
      const adminSnapshot = await this.db.collection("admins")
          .where("uid", "==", userId)
          .limit(1)
          .get();

      if (!adminSnapshot.empty) {
        // Update admin in admins collection
        const adminDoc = adminSnapshot.docs[0];
        await adminDoc.ref.update({
          active: status === "active",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Updated admin status in admins collection: ${userId}`);
      } else {
        // For regular users, update users collection
        const userRef = this.db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          await userRef.update({
            status: status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - Role (customer/admin/editor)
   * @return {boolean} Success status
   */
  async updateUserRole(userId, role) {
    try {
      if (!["customer", "admin", "editor"].includes(role)) {
        throw new Error(
            "Invalid role. Must be 'customer', 'admin', or 'editor'",
        );
      }

      // Update custom claims in Firebase Auth
      await admin.auth().setCustomUserClaims(userId, {role});

      // Check if this is an admin in the admins collection
      const adminSnapshot = await this.db.collection("admins")
          .where("uid", "==", userId)
          .limit(1)
          .get();

      if (!adminSnapshot.empty) {
        // Update admin in admins collection
        const adminDoc = adminSnapshot.docs[0];
        await adminDoc.ref.update({
          role: role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Updated admin role in admins collection: ${userId}`);
      } else {
        // For regular users, update users collection
        const userRef = this.db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          await userRef.update({
            role: role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }
}

module.exports = AdminUserService;
