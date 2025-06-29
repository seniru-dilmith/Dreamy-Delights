const admin = require("firebase-admin");

// Initialize Firebase Admin (make sure your service account key is configured)
admin.initializeApp();

/**
 * Script to set the first admin user
 * Usage: node setFirstAdmin.js <email>
 */
async function setFirstAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node setFirstAdmin.js <email>");
    process.exit(1);
  }

  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Set admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "admin",
    });

    console.log(`✅ Successfully set ${email} as admin`);
    console.log(`User ID: ${userRecord.uid}`);

    // Verify the claims were set
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log("Custom claims:", updatedUser.customClaims);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting admin role:", error.message);
    process.exit(1);
  }
}

setFirstAdmin();
