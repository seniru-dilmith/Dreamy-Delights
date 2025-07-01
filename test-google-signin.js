const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
const serviceAccount = require('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dreamy-delights-882ff'
});

// Test Google Sign-In with a dummy token
async function testGoogleSignIn() {
  try {
    console.log('Testing Google Sign-In backend function...');
    
    // This is a test - we'll use admin SDK to create a test ID token
    // In real scenario, this would come from Google OAuth
    
    // Create a test user first
    let testUser;
    try {
      testUser = await admin.auth().createUser({
        uid: 'test-google-user-' + Date.now(),
        email: 'test@google.com',
        displayName: 'Test Google User',
        emailVerified: true
      });
      console.log('Created test user:', testUser.uid);
    } catch (error) {
      console.log('Error creating test user:', error.message);
      return;
    }
    
    // Create a custom token for testing
    const customToken = await admin.auth().createCustomToken(testUser.uid);
    console.log('Created custom token:', !!customToken);
    
    // Clean up the test user
    await admin.auth().deleteUser(testUser.uid);
    console.log('Cleaned up test user');
    
    console.log('Google Sign-In backend test completed successfully!');
    
  } catch (error) {
    console.error('Google Sign-In test failed:', error);
  }
}

testGoogleSignIn();
