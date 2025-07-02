const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://dreamy-delights-882ff-default-rtdb.firebaseio.com/',
    storageBucket: 'dreamy-delights-882ff.appspot.com'
  });
}

const testUsers = [
  {
    email: 'john.doe@example.com',
    password: 'testpass123',
    displayName: 'John Doe',
    role: 'customer'
  },
  {
    email: 'jane.smith@example.com', 
    password: 'testpass123',
    displayName: 'Jane Smith',
    role: 'customer'
  },
  {
    email: 'editor@example.com',
    password: 'testpass123',
    displayName: 'Test Editor',
    role: 'editor'
  }
];

async function createTestUsers() {
  console.log('Creating test users...');
  
  for (const userData of testUsers) {
    try {
      // Create user with Admin SDK
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: true,
      });

      // Set custom claims for role
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: userData.role,
      });

      console.log(`✓ Created user: ${userData.displayName} (${userData.email}) - Role: ${userData.role}`);
      console.log(`  UID: ${userRecord.uid}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`- User ${userData.email} already exists, skipping...`);
      } else {
        console.error(`✗ Error creating user ${userData.email}:`, error.message);
      }
    }
  }
  
  // List all users to verify
  console.log('\nFetching all users...');
  const listUsersResult = await admin.auth().listUsers();
  console.log(`Total users: ${listUsersResult.users.length}`);
  
  for (const user of listUsersResult.users) {
    const customClaims = user.customClaims || {};
    console.log(`- ${user.displayName || 'No Name'} (${user.email}) - Role: ${customClaims.role || 'customer'} - Verified: ${user.emailVerified}`);
  }
}

// Run the script
createTestUsers().then(() => {
  console.log('\nScript completed!');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
