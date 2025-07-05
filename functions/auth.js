const functions = require("firebase-functions");
const admin = require("firebase-admin");

/**
 * Login with email and password
 */
exports.loginWithEmail = functions.https.onCall(async (data, context) => {
  console.log("loginWithEmail called with data:", data);

  // The data might be nested differently in 2nd gen functions
  let actualData = data;
  if (data.data) {
    actualData = data.data;
  }

  console.log("Using data:", JSON.stringify(actualData, null, 2));

  const {email, password} = actualData;

  if (!email || !password) {
    console.log("Missing email or password:",
        {email: !!email, password: !!password});
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Email and password are required",
    );
  }

  try {
    // Get Firebase API key from environment variables
    const firebaseApiKey = process.env.FB_API_KEY;

    if (!firebaseApiKey) {
      console.log("❌ Firebase API key not available");
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Firebase API key not configured",
      );
    }

    console.log("Using API key for authentication");

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
    const userRecord = await admin.auth().getUserByEmail(email);

    // For security, we'll create a custom token instead of using client auth
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    // Get user role from custom claims, default to 'customer'
    const userRole = (userRecord.customClaims &&
        userRecord.customClaims.role) || "customer";

    return {
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        role: userRole,
      },
      customToken,
    };
  } catch (error) {
    console.error("Email login error:", error);
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Invalid email or password",
    );
  }
});

/**
 * Register with email and password
 */
exports.registerWithEmail = functions.https.onCall(async (data, context) => {
  console.log("registerWithEmail called");

  // The data might be nested differently in 2nd gen functions
  let actualData = data;
  if (data.data) {
    actualData = data.data;
  }

  console.log("Extracted data keys:", Object.keys(actualData));
  console.log("Email:", actualData.email);
  console.log("Password length:",
      actualData.password ? actualData.password.length : 0);
  console.log("DisplayName:", actualData.displayName);

  const {email, password, displayName} = actualData;

  if (!email || !password || !displayName) {
    console.log("Missing required fields:",
        {email: !!email, password: !!password, displayName: !!displayName});
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Email, password, and display name are required",
    );
  }

  try {
    // Create user with Admin SDK
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false,
    });

    // Set default role as customer
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "customer",
    });

    // Create custom token for the client
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return {
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: displayName,
        photoURL: userRecord.photoURL,
        role: "customer",
      },
      customToken,
    };
  } catch (error) {
    console.error("Email registration error:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Registration failed",
    );
  }
});

/**
 * Login with Google OAuth
 */
exports.loginWithGoogle = functions.https.onCall(async (data, context) => {
  console.log("🚀 loginWithGoogle called");
  console.log("🌍 Environment variables:");
  console.log("  - GOOGLE_CLIENT_ID:",
      process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET");
  console.log("  - FB_API_KEY:", process.env.FB_API_KEY ? "SET" : "NOT SET");

  // The data might be nested differently in 2nd gen functions
  let actualData = data;
  if (data.data) {
    actualData = data.data;
  }

  console.log("📝 Extracted data keys:", Object.keys(actualData));
  console.log("🔑 ID Token received:", !!actualData.idToken);
  console.log("🔑 ID Token length:",
      actualData.idToken ? actualData.idToken.length : 0);

  const {idToken} = actualData;

  if (!idToken) {
    console.log("❌ Missing Google ID token");
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Google ID token is required",
    );
  }

  try {
    console.log("🔍 Verifying Google ID token...");

    // Get Google Client ID from environment variables
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    console.log("🆔 Using Google Client ID:",
        googleClientId ? "SET" : "NOT SET");

    if (!googleClientId) {
      console.log("❌ Google Client ID not available");
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Google Client ID not configured",
      );
    }

    // Verify Google ID token directly (skip Firebase token verification)
    console.log("🔍 Verifying Google ID token directly",
        "with google-auth-library");
    const {OAuth2Client} = require("google-auth-library");
    const client = new OAuth2Client(googleClientId);

    let decodedToken;
    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      console.log("✅ Google token verified for user:", payload.email);
      console.log("👤 User payload:", {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
      });

      // Create a decoded token object
      decodedToken = {
        uid: payload.sub, // Google user ID
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
      };
    } catch (googleError) {
      console.error("❌ Failed to verify Google token:", googleError);
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Invalid Google ID token: " + googleError.message,
      );
    }

    console.log("👤 Decoded token:", decodedToken);

    // Create or get user - use email-based lookup
    let userRecord;
    let isNewUser = false;
    try {
      console.log("🔍 Looking up user by email:", decodedToken.email);
      userRecord = await admin.auth().getUserByEmail(decodedToken.email);
      console.log("✅ Existing user found:", {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      });
    } catch (error) {
      console.log("👤 User not found, creating new user for:",
          decodedToken.email);
      console.log("🔧 User creation parameters:", {
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        emailVerified: decodedToken.email_verified,
      });

      try {
        userRecord = await admin.auth().createUser({
          email: decodedToken.email,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
          emailVerified: decodedToken.email_verified,
        });
        console.log("✅ New user created:", {
          uid: userRecord.uid,
          email: userRecord.email,
        });
        isNewUser = true;
      } catch (createError) {
        console.error("❌ Failed to create user:", createError);
        throw new functions.https.HttpsError(
            "internal",
            "Failed to create user: " + createError.message,
        );
      }
    }

    // Set default role for new users
    if (isNewUser) {
      console.log("🏷️ Setting role for new user");
      try {
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: "customer",
        });
        console.log("✅ Role set successfully");
      } catch (roleError) {
        console.error("⚠️ Failed to set role:", roleError);
        // Don't fail the login for this
      }
    }

    // Create custom token for the client
    console.log("🔑 Creating custom token for uid:", userRecord.uid);
    let customToken;
    try {
      customToken = await admin.auth().createCustomToken(userRecord.uid);
      console.log("✅ Custom token created successfully");
    } catch (tokenError) {
      console.error("❌ Failed to create custom token:", tokenError);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to create authentication token: " + tokenError.message,
      );
    }

    // Get user role from custom claims, default to 'customer'
    const userRole = (userRecord.customClaims &&
        userRecord.customClaims.role) || "customer";

    const response = {
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        role: userRole,
      },
      customToken,
    };

    console.log("🎉 Google login successful for:", userRecord.email);
    console.log("📤 Returning response:", {
      success: response.success,
      user: response.user,
      customTokenLength: response.customToken ? response.customToken.length : 0,
    });

    return response;
  } catch (error) {
    console.error("💥 Google login error:", error);
    console.error("💥 Error stack:", error.stack);

    // Re-throw HttpsError as-is, wrap others
    if (error.code && error.code.startsWith("functions/")) {
      throw error;
    }

    throw new functions.https.HttpsError(
        "internal",
        "Google authentication failed: " + error.message,
    );
  }
});

/**
 * Get current user info
 */
exports.getCurrentUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return {user: null};
  }

  try {
    const userRecord = await admin.auth().getUser(context.auth.uid);

    // Get user role from custom claims, default to 'customer'
    const userRole = (userRecord.customClaims &&
        userRecord.customClaims.role) || "customer";

    return {
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        role: userRole,
      },
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return {user: null};
  }
});

/**
 * Logout user
 */
exports.logout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
    );
  }

  try {
    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(context.auth.uid);

    return {success: true};
  } catch (error) {
    console.error("Logout error:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Logout failed",
    );
  }
});

/**
 * Refresh user token
 */
exports.refreshToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
    );
  }

  try {
    // Create a new custom token
    const customToken = await admin.auth().createCustomToken(context.auth.uid);

    return {
      success: true,
      customToken,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Token refresh failed",
    );
  }
});

/**
 * Set user role (admin only)
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
    );
  }

  const {uid, role} = data;

  if (!uid || !role) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "User ID and role are required",
    );
  }

  // Valid roles
  const validRoles = ["customer", "admin"];
  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid role. Must be 'customer' or 'admin'",
    );
  }

  try {
    // Check if current user is admin
    const currentUserRecord = await admin.auth().getUser(context.auth.uid);
    const currentUserRole = (currentUserRecord.customClaims &&
        currentUserRecord.customClaims.role) || "customer";

    if (currentUserRole !== "admin") {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Only admins can set user roles",
      );
    }

    // Set the custom claims for the target user
    await admin.auth().setCustomUserClaims(uid, {role: role});

    return {
      success: true,
      message: `User role updated to ${role}`,
    };
  } catch (error) {
    console.error("Set user role error:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to set user role",
    );
  }
});

/**
 * Admin authentication functions - DEPRECATED
 * All admin functions have been moved to HTTP endpoints in routes/admin.js
 * The callable functions have been removed to prevent CORS issues.
 *
 * Available HTTP endpoints:
 * - POST /api/admin/login
 * - POST /api/admin/logout
 * - POST /api/admin/verify-token
 * - POST /api/admin/create-initial-admin
 */
