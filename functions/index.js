const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const apiRouter = require("./routes");

// Import middleware for legacy callable functions
const {requireAdminCallable} = require("./middleware/auth");

// Import auth functions
const authFunctions = require("./auth");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// API Routes - all HTTP endpoints go through Express router
app.use("/api", apiRouter);

// Export the main HTTP function
exports.api = functions.https.onRequest(app);

// LEGACY CALLABLE FUNCTIONS
// These remain as Firebase callable functions for existing clients

/**
 * Get user orders - Legacy callable function
 * @deprecated Use /api/orders/user endpoint instead
 */
exports.getUserOrders = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
    );
  }

  try {
    const userId = context.auth.uid;
    const snapshot = await db.collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch orders");
  }
});

/**
 * Create order - Legacy callable function
 * @deprecated Use /api/orders endpoint instead
 */
exports.createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
    );
  }

  try {
    const userId = context.auth.uid;
    const {items, totalAmount, shippingAddress} = data;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Order items are required",
      );
    }

    const orderData = {
      userId,
      items,
      totalAmount,
      shippingAddress,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("orders").add(orderData);

    return {
      success: true,
      orderId: docRef.id,
      message: "Order created successfully",
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw new functions.https.HttpsError("internal", "Failed to create order");
  }
});

/**
 * Update user profile - Legacy callable function
 * @deprecated Use /api/users/profile endpoint instead
 */
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
    );
  }

  try {
    const userId = context.auth.uid;
    const {name, email, phone, address} = data;

    const updateData = {
      name,
      email,
      phone,
      address,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(userId).set(updateData, {merge: true});

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to update profile",
    );
  }
});

/**
 * Update order status - Legacy callable function
 * @deprecated Use /api/orders/:id/status endpoint instead
 */
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
  try {
    // Use middleware for admin verification
    await requireAdminCallable(context);

    const {orderId, status} = data;

    if (!orderId || !status) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Order ID and status are required",
      );
    }

    await db.collection("orders").doc(orderId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Order status updated successfully",
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to update order status",
    );
  }
});

// LEGACY HTTP FUNCTIONS FOR BACKWARD COMPATIBILITY
// These provide simple redirects to the new API structure

/**
 * Get featured products - Legacy HTTP function
 * @deprecated Use /api/products/featured endpoint instead
 */
exports.getFeaturedProducts = functions.https.onRequest((req, res) => {
  res.status(301).json({
    message: "This endpoint has moved. Please use /api/products/featured",
    newEndpoint: "/api/products/featured",
  });
});

/**
 * Get products - Legacy HTTP function
 * @deprecated Use /api/products endpoint instead
 */
exports.getProducts = functions.https.onRequest((req, res) => {
  res.status(301).json({
    message: "This endpoint has moved. Please use /api/products",
    newEndpoint: "/api/products",
  });
});

/**
 * Get all orders - Legacy HTTP function
 * @deprecated Use /api/orders/all endpoint instead
 */
exports.getAllOrders = functions.https.onRequest((req, res) => {
  res.status(301).json({
    message: "This endpoint has moved. Please use /api/orders/all",
    newEndpoint: "/api/orders/all",
  });
});

/**
 * Manage product - Legacy HTTP function
 * @deprecated Use /api/products endpoints instead
 */
exports.manageProduct = functions.https.onRequest((req, res) => {
  res.status(301).json({
    message: "This endpoint has moved. Please use /api/products",
    newEndpoint: "/api/products",
  });
});

/**
 * Get server time - Legacy HTTP function
 * @deprecated Use /api/server-time endpoint instead
 */
exports.getServerTime = functions.https.onRequest((req, res) => {
  res.status(301).json({
    message: "This endpoint has moved. Please use /api/server-time",
    newEndpoint: "/api/server-time",
  });
});

// Export auth functions
exports.loginWithEmail = authFunctions.loginWithEmail;
exports.registerWithEmail = authFunctions.registerWithEmail;
exports.loginWithGoogle = authFunctions.loginWithGoogle;
exports.loginWithFacebook = authFunctions.loginWithFacebook;
exports.getCurrentUser = authFunctions.getCurrentUser;
exports.logout = authFunctions.logout;
exports.refreshToken = authFunctions.refreshToken;
exports.setUserRole = authFunctions.setUserRole;
