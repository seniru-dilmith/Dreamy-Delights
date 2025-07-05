const express = require("express");
const admin = require("firebase-admin");
const multer = require("multer");
const {v4: uuidv4} = require("uuid");
const {
  verifyAdminToken,
  requirePermission,
  requireAnyPermission,
} = require("../middleware/adminAuth");

// eslint-disable-next-line new-cap
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 1 * 1024 * 1024, // 1MB for field values
    fields: 20, // Maximum number of fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * Admin login endpoint - must be before auth middleware
 */
router.post("/login", async (req, res) => {
  try {
    console.log("🔐 Admin HTTP login attempt:", req.body);

    const {username, password} = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Check against Firestore admins collection
    const db = admin.firestore();
    const adminSnapshot = await db.collection("admins")
        .where("username", "==", username)
        .limit(1)
        .get();

    if (adminSnapshot.empty) {
      console.log("🔐 Admin not found:", username);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();

    // Check if admin is active
    if (!adminData.active) {
      console.log("🔐 Admin account disabled:", username);
      return res.status(401).json({
        success: false,
        message: "Account disabled",
      });
    }

    // Verify password
    const bcrypt = require("bcryptjs");
    const passwordMatch = await bcrypt.compare(password,
        adminData.hashedPassword);

    if (!passwordMatch) {
      console.log("🔐 Invalid password for:", username);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await adminDoc.ref.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Generate JWT token
    const jwt = require("jsonwebtoken");
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
        process.env.ADMIN_JWT_SECRET ||
          "your-super-secure-jwt-secret-change-this-in-production",
        {expiresIn: "24h"},
    );

    console.log("🔐 Admin login successful:", username);

    res.json({
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
    });
  } catch (error) {
    console.error("🔐 Admin HTTP login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Apply admin authentication to all routes below this point
router.use(verifyAdminToken);

/**
 * Get dashboard statistics
 */
router.get("/dashboard/stats",
    requireAnyPermission(["view_analytics", "manage_products",
      "manage_orders"]),
    async (req, res) => {
      try {
        const db = admin.firestore();

        // Get products count
        const productsSnapshot = await db.collection("products").get();
        const totalProducts = productsSnapshot.size;

        // Get orders count and revenue
        const ordersSnapshot = await db.collection("orders").get();
        const totalOrders = ordersSnapshot.size;

        let totalRevenue = 0;
        let pendingOrders = 0;
        let recentOrders = 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          if (orderData.totalAmount) {
            totalRevenue += orderData.totalAmount;
          }
          if (orderData.status === "pending") {
            pendingOrders++;
          }
          if (orderData.createdAt &&
              orderData.createdAt.toDate() > thirtyDaysAgo) {
            recentOrders++;
          }
        });

        // Get users count
        const usersSnapshot = await db.collection("users").get();
        const totalUsers = usersSnapshot.size;

        const averageOrderValue = totalOrders > 0 ?
          parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

        res.json({
          success: true,
          data: {
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            recentOrders,
            pendingOrders,
            averageOrderValue,
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch dashboard statistics",
        });
      }
    });

/**
 * Get all products with admin details
 */
router.get("/products",
    requirePermission("manage_products"),
    async (req, res) => {
      try {
        const db = admin.firestore();
        const snapshot = await db.collection("products")
            .orderBy("createdAt", "desc")
            .get();

        const products = [];
        snapshot.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        res.json({
          success: true,
          data: products,
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch products",
        });
      }
    });

/**
 * Create new product - handles both JSON and FormData
 */
router.post("/products",
    requirePermission("manage_products"),
    // Conditional middleware based on content type with error handling
    (req, res, next) => {
      const contentType = req.get("Content-Type") || "";
      console.log("📋 POST /products - Content-Type:", contentType);

      if (contentType.includes("multipart/form-data")) {
        console.log("📸 Using multer middleware for FormData");
        // Use multer for FormData with error handling
        upload.single("image")(req, res, (err) => {
          if (err) {
            console.error("❌ Multer error:", err);
            return res.status(400).json({
              success: false,
              message: "File upload error: " + err.message,
            });
          }
          console.log("✅ Multer processed successfully");
          next();
        });
      } else {
        console.log("📄 Skipping multer for JSON/form-encoded data");
        // Skip multer for JSON
        next();
      }
    },
    async (req, res) => {
      try {
        console.log("Creating product - Request body:", req.body);
        console.log("Creating product - File info:", req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        } : "No file");

        const db = admin.firestore();
        const storage = admin.storage();
        const bucket = storage.bucket();

        const {
          name,
          description,
          price,
          category,
          available,
          featured,
          stock,
          active,
          imageUrl: providedImageUrl,
        } = req.body;

        // Validate required fields
        if (!name || !description || !price || !category) {
          console.log("Validation failed - missing required fields");
          return res.status(400).json({
            success: false,
            message: "Name, description, price, and category are required",
          });
        }

        let imageUrl = providedImageUrl || null;

        // Upload image if provided
        if (req.file) {
          console.log("Starting image upload...");

          try {
            // Check if storage bucket exists first
            console.log("Checking if storage bucket exists:", bucket.name);

            const [exists] = await bucket.exists();
            if (!exists) {
              console.log("❌ Storage bucket does not exist");
              return res.status(500).json({
                success: false,
                message: "Firebase Storage is not enabled. Please enable " +
                  "Firebase Storage in the Firebase Console and try again.",
                error: "storage_bucket_not_found",
              });
            }

            console.log("✅ Storage bucket exists, proceeding with upload");

            const fileName = `products/${uuidv4()}-${req.file.originalname}`;
            const file = bucket.file(fileName);

            await file.save(req.file.buffer, {
              metadata: {
                contentType: req.file.mimetype,
              },
            });
            console.log("Image saved to storage:", fileName);

            // Make file publicly readable
            await file.makePublic();
            console.log("Image made public");

            imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            console.log("Image URL generated:", imageUrl);
          } catch (storageError) {
            console.error("Storage error details:", storageError);

            if (storageError.message &&
                storageError.message.includes("bucket does not exist")) {
              return res.status(500).json({
                success: false,
                message: "Firebase Storage bucket not found. Please enable " +
                  "Firebase Storage in the Firebase Console.",
                error: "storage_bucket_not_found",
              });
            } else if (storageError.code === "storage/unauthorized") {
              return res.status(500).json({
                success: false,
                message: "Storage unauthorized. Please check Firebase " +
                  "Storage rules and service account permissions.",
                error: "storage_unauthorized",
              });
            } else {
              return res.status(500).json({
                success: false,
                message: `Image upload failed: ${storageError.message}`,
                error: "storage_upload_failed",
              });
            }
          }
        }

        const productData = {
          name,
          description,
          price: parseFloat(price),
          category,
          available: available === "true" || available === true,
          featured: featured === "true" || featured === true,
          stock: stock !== undefined ? parseInt(stock) : 0,
          active: active !== undefined ?
            (active === "true" || active === true) : true,
          imageUrl,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: req.admin.id,
        };
        console.log("Product data prepared:", productData);

        const docRef = await db.collection("products").add(productData);
        console.log("Product saved to Firestore with ID:", docRef.id);

        res.json({
          success: true,
          data: {
            id: docRef.id,
            ...productData,
          },
          message: "Product created successfully",
        });
      } catch (error) {
        console.error("Error creating product:", error);

        // More specific error messages
        let errorMessage = "Failed to create product";
        if (error.code === "permission-denied") {
          errorMessage = "Permission denied: Check Firebase Storage rules";
        } else if (error.code === "storage/unauthorized") {
          errorMessage = "Storage unauthorized: Check service account perms";
        } else if (error.code === "storage/bucket-not-found") {
          errorMessage = "Storage bucket not found";
        } else if (error.message) {
          errorMessage = `Failed to create product: ${error.message}`;
        }

        res.status(500).json({
          success: false,
          message: errorMessage,
          error: process.env.NODE_ENV === "development" ?
            error.stack : undefined,
        });
      }
    });

/**
 * Update product - handles both JSON and FormData
 */
router.put("/products/:id",
    requirePermission("manage_products"),
    // Conditional middleware based on content type with error handling
    (req, res, next) => {
      console.log("🔄 PUT /products/:id - Starting middleware");
      const contentType = req.get("Content-Type") || "";
      console.log("📋 PUT /products/:id - Content-Type:", contentType);

      if (contentType.includes("multipart/form-data")) {
        console.log("📸 Using multer middleware for FormData");
        // Use multer for FormData with error handling
        upload.single("image")(req, res, (err) => {
          if (err) {
            console.error("❌ Multer error:", err);
            return res.status(400).json({
              success: false,
              message: "File upload error: " + err.message,
            });
          }
          console.log("✅ Multer processed successfully");
          next();
        });
      } else {
        console.log("📄 Skipping multer for JSON data");
        // Skip multer for JSON
        next();
      }
    },
    async (req, res) => {
      console.log("🔄 PUT /products/:id - Main handler started");
      try {
        console.log("🔄 Updating product - Product ID:", req.params.id);
        console.log("🔄 Updating product - Request body:", req.body);
        console.log("🔄 Updating product - Content-Type:",
            req.get("Content-Type"));
        console.log("🔄 Updating product - Admin ID:",
            req.admin ? req.admin.id : "No admin");
        console.log("🔄 Updating product - File info:", req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        } : "No file");

        const db = admin.firestore();
        const storage = admin.storage();
        const bucket = storage.bucket();

        const {id} = req.params;

        // Validate product ID
        if (!id || typeof id !== "string" || id.trim() === "") {
          console.log("❌ Invalid product ID provided:", {
            id,
            type: typeof id,
            params: req.params,
          });
          return res.status(400).json({
            success: false,
            message: "Invalid product ID provided",
          });
        }

        console.log("🔍 Looking up product with ID:", id);

        const {
          name,
          description,
          price,
          category,
          available,
          featured,
          stock,
          active,
          imageUrl,
        } = req.body;

        console.log("🔄 Extracted fields:", {
          id,
          name,
          description,
          price,
          category,
          available,
          featured,
          stock,
          active,
          imageUrl,
        });

        const productRef = db.collection("products").doc(id);
        console.log("🔍 Checking if product exists:", productRef.path);

        const productDoc = await productRef.get();

        if (!productDoc.exists) {
          console.log("❌ Product not found in database:", {
            id,
            docPath: productRef.path,
            exists: productDoc.exists,
          });

          // List all products for debugging
          const allProductsSnapshot = await db.collection("products").get();
          const existingIds = allProductsSnapshot.docs.map((doc) => doc.id);
          console.log("📋 Existing product IDs:", existingIds);

          return res.status(404).json({
            success: false,
            message: "Product not found",
            debug: {
              requestedId: id,
              existingIds: existingIds.slice(0, 5), // Show first 5 for brevity
              totalProducts: existingIds.length,
            },
          });
        }

        console.log("✅ Product found, preparing update data");
        console.log("📊 Current product data:", productDoc.data());

        const updateData = {
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: req.admin.id,
        };

        // Update fields if provided
        if (name !== undefined && name !== "") updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined && !isNaN(parseFloat(price))) {
          updateData.price = parseFloat(price);
        }
        if (category !== undefined && category !== "") {
          updateData.category = category;
        }
        if (available !== undefined) {
          updateData.available = available === "true" || available === true;
        }
        if (featured !== undefined) {
          updateData.featured = featured === "true" || featured === true;
        }
        if (stock !== undefined && !isNaN(parseInt(stock))) {
          updateData.stock = parseInt(stock);
        }
        if (active !== undefined) {
          updateData.active = active === "true" || active === true;
        }
        if (imageUrl !== undefined && imageUrl !== "") {
          updateData.imageUrl = imageUrl;
        }

        console.log("🔄 Update data prepared:", updateData);

        // Handle image upload
        if (req.file) {
          const fileName = `products/${uuidv4()}-${req.file.originalname}`;
          const file = bucket.file(fileName);

          await file.save(req.file.buffer, {
            metadata: {
              contentType: req.file.mimetype,
            },
          });

          await file.makePublic();
          updateData.imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

          // TODO: Delete old image from storage if exists
        }

        await productRef.update(updateData);

        res.json({
          success: true,
          message: "Product updated successfully",
        });
      } catch (error) {
        // Log full request body to debug update failure
        console.error("Request body on failure:", req.body);
        console.error("Error updating product:", error);
        res.status(500).json({
          success: false,
          message: error.message || "Failed to update Produkt",
          error: error.stack || String(error),
        });
      }
    });

/**
 * Delete product
 */
router.delete("/products/:id",
    requirePermission("manage_products"),
    async (req, res) => {
      try {
        const db = admin.firestore();
        const {id} = req.params;

        const productRef = db.collection("products").doc(id);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        // TODO: Delete associated image from storage

        await productRef.delete();

        res.json({
          success: true,
          message: "Product deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
          success: false,
          message: "Failed to delete product",
        });
      }
    });

/**
 * Get all orders with admin details
 */
router.get("/orders", requirePermission("manage_orders"), async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection("orders")
        .orderBy("createdAt", "desc")
        .get();

    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

/**
 * Update order status
 */
router.put("/orders/:id/status",
    requirePermission("manage_orders"),
    async (req, res) => {
      try {
        const db = admin.firestore();
        const {id} = req.params;
        const {status} = req.body;

        if (!status) {
          return res.status(400).json({
            success: false,
            message: "Status is required",
          });
        }

        const orderRef = db.collection("orders").doc(id);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        await orderRef.update({
          status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: req.admin.id,
        });

        res.json({
          success: true,
          message: "Order status updated successfully",
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update order status",
        });
      }
    });

/**
 * Get all users
 */
router.get("/users", requirePermission("manage_users"), async (req, res) => {
  try {
    const db = admin.firestore();

    // Fetch users from Firebase Authentication
    const listUsersResult = await admin.auth().listUsers();
    const authUsers = listUsersResult.users;

    // Get all admins from the admins collection for quick lookup
    const adminsSnapshot = await db.collection("admins").get();
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
          const userDoc = await db.collection("users").doc(authUser.uid).get();
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

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

/**
 * Update user status (enable/disable user)
 */
router.patch("/users/:userId/status",
    requirePermission("manage_users"),
    async (req, res) => {
      try {
        const {userId} = req.params;
        const {status} = req.body;

        if (!["active", "banned"].includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid status. Must be 'active' or 'banned'",
          });
        }

        // Update Firebase Auth user
        await admin.auth().updateUser(userId, {
          disabled: status === "banned",
        });

        // Check if this is an admin in the admins collection
        const db = admin.firestore();
        const adminSnapshot = await db.collection("admins")
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
          const userRef = db.collection("users").doc(userId);
          const userDoc = await userRef.get();

          if (userDoc.exists) {
            await userRef.update({
              status: status,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        res.json({
          success: true,
          message: `User ${status === "banned" ? "disabled" : "enabled"}` +
            " successfully",
        });
      } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update user status",
        });
      }
    });

/**
 * Update user role
 */
router.patch("/users/:userId/role",
    requirePermission("manage_users"),
    async (req, res) => {
      try {
        const {userId} = req.params;
        const {role} = req.body;

        if (!["customer", "admin", "editor"].includes(role)) {
          return res.status(400).json({
            success: false,
            message: "Invalid role. Must be 'customer', 'admin', or 'editor'",
          });
        }

        // Update custom claims in Firebase Auth
        await admin.auth().setCustomUserClaims(userId, {role});

        // Check if this is an admin in the admins collection
        const db = admin.firestore();
        const adminSnapshot = await db.collection("admins")
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
          const userRef = db.collection("users").doc(userId);
          const userDoc = await userRef.get();

          if (userDoc.exists) {
            await userRef.update({
              role: role,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        res.json({
          success: true,
          message: "User role updated successfully",
        });
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update user role",
        });
      }
    });

/**
 * Get website content/settings
 */
router.get("/content",
    requirePermission("manage_content"),

    async (req, res) => {
      try {
        const db = admin.firestore();
        const snapshot = await db.collection("content").get();

        const content = {};
        snapshot.forEach((doc) => {
          content[doc.id] = doc.data();
        });

        res.json({
          success: true,
          data: content,
        });
      } catch (error) {
        console.error("Error fetching content:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch content",
        });
      }
    });

/**
 * Update website content/settings
 */
router.put("/content/:section",
    requirePermission("manage_content"),
    async (req, res) => {
      try {
        const db = admin.firestore();
        const {section} = req.params;
        const contentData = req.body;

        await db.collection("content").doc(section).set({
          ...contentData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: req.admin.id,
        }, {merge: true});

        res.json({
          success: true,
          message: "Content updated successfully",
        });
      } catch (error) {
        console.error("Error updating content:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update content",
        });
      }
    });

/**
 * Get analytics data
 */
router.get("/analytics",
    requirePermission("view_analytics"),
    async (req, res) => {
      try {
        const db = admin.firestore();

        // Get basic counts
        const [productsCount, ordersCount, usersCount] = await Promise.all([
          db.collection("products").get().then((snapshot) => snapshot.size),
          db.collection("orders").get().then((snapshot) => snapshot.size),
          db.collection("users").get().then((snapshot) => snapshot.size),
        ]);

        // Get recent orders for revenue calculation
        const recentOrders = await db.collection("orders")
            .where("createdAt", ">=", new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000,
            ))
            .get();

        let monthlyRevenue = 0;
        recentOrders.forEach((doc) => {
          const order = doc.data();
          if (order.totalAmount) {
            monthlyRevenue += order.totalAmount;
          }
        });

        res.json({
          success: true,
          data: {
            productsCount,
            ordersCount,
            usersCount,
            monthlyRevenue,
            recentOrdersCount: recentOrders.size,
          },
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch analytics",
        });
      }
    });

/**
 * Get admin settings
 */
router.get("/settings",
    requireAnyPermission(["manage_settings", "manage_admins"]),
    async (req, res) => {
      try {
        const db = admin.firestore();
        const snapshot = await db.collection("adminSettings").get();

        const settings = {};
        snapshot.forEach((doc) => {
          settings[doc.id] = doc.data();
        });

        res.json({
          success: true,
          data: settings,
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch settings",
        });
      }
    });

/**
 * Update admin settings
 */
router.put("/settings/:key",
    requirePermission("manage_settings"),
    async (req, res) => {
      try {
        const db = admin.firestore();
        const {key} = req.params;
        const settingData = req.body;

        await db.collection("adminSettings").doc(key).set({
          ...settingData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: req.admin.id,
        }, {merge: true});

        res.json({
          success: true,
          message: "Settings updated successfully",
        });
      } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update settings",
        });
      }
    });
/**
 * Toggle product featured status
 */
router.put("/products/:id/featured",
    requirePermission("manage_products"),
    async (req, res) => {
      try {
        const db = admin.firestore();
        const {id} = req.params;

        const productRef = db.collection("products").doc(id);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        const currentData = productDoc.data();
        const newFeaturedStatus = !currentData.featured;

        await productRef.update({
          featured: newFeaturedStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: req.admin.id,
        });

        res.json({
          success: true,
          featured: newFeaturedStatus,
          message: newFeaturedStatus ?
            "Product added to featured products" :
            "Product removed from featured products",
        });
      } catch (error) {
        console.error("Error toggling featured status:", error);
        res.status(500).json({
          success: false,
          message: "Failed to toggle featured status",
        });
      }
    });
/**
 * Contact Messages Management Routes
 */

/**
 * Get all contact messages
 */
router.get("/contact-messages",
    requireAnyPermission(["manage_content", "view_analytics"]),
    async (req, res) => {
      try {
        const ContactMessageModel = require("../models/ContactMessage");
        const contactMessageModel = new ContactMessageModel();

        const {status, limit} = req.query;
        const options = {};

        if (status && ["unread", "read", "replied"].includes(status)) {
          options.status = status;
        }

        if (limit && !isNaN(parseInt(limit))) {
          options.limit = parseInt(limit);
        }

        const messages = await contactMessageModel.getAll(options);

        res.json({
          success: true,
          data: messages,
          count: messages.length,
        });
      } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch contact messages",
        });
      }
    });

/**
 * Get contact message statistics
 */
router.get("/contact-messages/stats",
    requireAnyPermission(["manage_content", "view_analytics"]),
    async (req, res) => {
      try {
        const ContactMessageModel = require("../models/ContactMessage");
        const contactMessageModel = new ContactMessageModel();

        const stats = await contactMessageModel.getStats();

        res.json({
          success: true,
          data: stats,
        });
      } catch (error) {
        console.error("Error fetching contact message stats:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch contact message statistics",
        });
      }
    });

/**
 * Get a specific contact message
 */
router.get("/contact-messages/:id",
    requireAnyPermission(["manage_content", "view_analytics"]),
    async (req, res) => {
      try {
        const ContactMessageModel = require("../models/ContactMessage");
        const contactMessageModel = new ContactMessageModel();
        const {id} = req.params;

        if (!id) {
          return res.status(400).json({
            success: false,
            message: "Contact message ID is required",
          });
        }

        const message = await contactMessageModel.getById(id);

        if (!message) {
          return res.status(404).json({
            success: false,
            message: "Contact message not found",
          });
        }

        res.json({
          success: true,
          data: message,
        });
      } catch (error) {
        console.error("Error fetching contact message:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch contact message",
        });
      }
    });

/**
 * Mark contact message as read
 */
router.patch("/contact-messages/:id/read",
    requirePermission("manage_content"),
    async (req, res) => {
      try {
        const ContactMessageModel = require("../models/ContactMessage");
        const contactMessageModel = new ContactMessageModel();
        const {id} = req.params;

        if (!id) {
          return res.status(400).json({
            success: false,
            message: "Contact message ID is required",
          });
        }

        const updatedMessage = await contactMessageModel.markAsRead(
            id,
            req.admin.id,
        );

        res.json({
          success: true,
          message: "Contact message marked as read",
          data: updatedMessage,
        });
      } catch (error) {
        console.error("Error marking contact message as read:", error);

        if (error.message === "Contact message not found") {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }

        res.status(500).json({
          success: false,
          message: "Failed to mark contact message as read",
        });
      }
    });

/**
 * Mark contact message as replied and send email
 */
router.patch("/contact-messages/:id/reply",
    requirePermission("manage_content"),
    async (req, res) => {
      try {
        console.log("🔍 Reply endpoint called with:", {
          id: req.params.id,
          body: req.body,
          adminId: req.admin ? req.admin.id : null,
        });

        const ContactMessageModel = require("../models/ContactMessage");
        const EmailService = require("../services/EmailService");
        const contactMessageModel = new ContactMessageModel();
        const {id} = req.params;
        const {replyText} = req.body;

        if (!id) {
          console.log("❌ Missing ID");
          return res.status(400).json({
            success: false,
            message: "Contact message ID is required",
          });
        }

        // Reply text is optional - can be empty for just marking as replied
        const finalReplyText = replyText && replyText.trim() ?
          replyText.trim() : null;

        console.log("🔍 Processing reply:", {
          originalReplyText: replyText,
          finalReplyText,
          hasReplyText: !!finalReplyText,
        });

        // Get the original message first
        const originalMessage = await contactMessageModel.getById(id);
        if (!originalMessage) {
          return res.status(404).json({
            success: false,
            message: "Contact message not found",
          });
        }

        // Mark as replied in database
        const updatedMessage = await contactMessageModel.markAsReplied(
            id,
            req.admin.id,
            finalReplyText,
        );

        let emailSent = false;
        let emailError = null;

        // Try to send email reply (only if there's actual reply text)
        try {
          console.log("🔍 Email service check:");

          // Initialize EmailService before checking availability
          await EmailService.initialize();

          console.log("  EmailService available:", EmailService.isAvailable());
          console.log("  finalReplyText exists:", !!finalReplyText);
          console.log("  finalReplyText length:",
                      finalReplyText ? finalReplyText.length : 0);

          if (EmailService.isAvailable() && finalReplyText) {
            // Construct customer name from firstName and lastName
            const firstName = originalMessage.firstName || "";
            const lastName = originalMessage.lastName || "";
            const customerName = `${firstName} ${lastName}`.trim() ||
                                originalMessage.name ||
                                "Customer";

            console.log(
                `🔍 Sending email to: ${originalMessage.email}, ` +
                `Name: ${customerName}`,
            );

            await EmailService.sendContactReply({
              to: originalMessage.email,
              customerName: customerName,
              originalSubject: originalMessage.subject,
              replyMessage: finalReplyText,
              adminName: req.admin.username || "Dreamy Delights Team",
            });
            emailSent = true;
            console.log(`✅ Reply email sent to ${originalMessage.email}`);
          } else if (!finalReplyText) {
            console.log(
                "📝 No reply text - message marked as replied without email",
            );
          } else {
            console.warn(
                "📧 Email service not available - reply saved but not sent",
            );
            emailError = "Email service not configured";
          }
        } catch (error) {
          console.error("❌ Failed to send reply email:", error);
          emailError = error.message;
        }

        const successMessage = emailSent ?
          "Reply sent successfully and email delivered" :
          "Reply saved successfully" +
          (emailError ? ` (Email not sent: ${emailError})` : "");

        res.json({
          success: true,
          message: successMessage,
          data: updatedMessage,
          emailSent,
          emailError,
        });
      } catch (error) {
        console.error("Error marking contact message as replied:", error);

        if (error.message === "Contact message not found") {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }

        res.status(500).json({
          success: false,
          message: "Failed to mark contact message as replied",
        });
      }
    });

/**
 * Update contact message
 */
router.patch("/contact-messages/:id",
    requirePermission("manage_content"),
    async (req, res) => {
      try {
        const ContactMessageModel = require("../models/ContactMessage");
        const contactMessageModel = new ContactMessageModel();
        const {id} = req.params;
        const updateData = req.body;

        if (!id) {
          return res.status(400).json({
            success: false,
            message: "Contact message ID is required",
          });
        }

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.createdAt;
        delete updateData.ipAddress;
        delete updateData.userAgent;

        const updatedMessage = await contactMessageModel.update(
            id,
            updateData,
        );

        res.json({
          success: true,
          message: "Contact message updated successfully",
          data: updatedMessage,
        });
      } catch (error) {
        console.error("Error updating contact message:", error);

        if (error.message === "Contact message not found") {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }

        res.status(500).json({
          success: false,
          message: "Failed to update contact message",
        });
      }
    });

/**
 * Delete contact message
 */
router.delete("/contact-messages/:id",
    requirePermission("manage_content"),
    async (req, res) => {
      try {
        const ContactMessageModel = require("../models/ContactMessage");
        const contactMessageModel = new ContactMessageModel();
        const {id} = req.params;

        if (!id) {
          return res.status(400).json({
            success: false,
            message: "Contact message ID is required",
          });
        }

        await contactMessageModel.delete(id);

        res.json({
          success: true,
          message: "Contact message deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting contact message:", error);

        if (error.message === "Contact message not found") {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }

        res.status(500).json({
          success: false,
          message: "Failed to delete contact message",
        });
      }
    });

module.exports = router;
