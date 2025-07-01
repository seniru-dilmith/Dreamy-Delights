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

    // Simple check for admin credentials (for testing)
    if (username === "admin" && password === "admin123") {
      const jwt = require("jsonwebtoken");

      // Generate a simple JWT token for testing
      const token = jwt.sign(
          {
            id: "test-admin-id",
            username: "admin",
            role: "super_admin",
            permissions: [
              "manage_products",
              "manage_orders",
              "manage_users",
              "manage_content",
              "manage_testimonials",
              "manage_settings",
              "view_analytics",
              "debug",
            ],
            type: "admin",
          },
          process.env.ADMIN_JWT_SECRET ||
            "your-super-secure-jwt-secret-change-this-in-production",
          {expiresIn: "24h"},
      );

      console.log("🔐 Admin login successful (test mode)");

      res.json({
        success: true,
        token,
        admin: {
          id: "test-admin-id",
          username: "admin",
          role: "super_admin",
          permissions: [
            "manage_products",
            "manage_orders",
            "manage_users",
            "manage_content",
            "manage_testimonials",
            "manage_settings",
            "view_analytics",
            "debug",
          ],
        },
        message: "Admin login successful",
      });
    } else {
      console.log("🔐 Invalid credentials:", username);
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
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
    const snapshot = await db.collection("users")
        .orderBy("createdAt", "desc")
        .get();

    const users = [];
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

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

module.exports = router;
