const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dreamy-delights-882ff-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users...');
    
    // Check Firestore for admin users
    const adminUsersSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .get();
    
    console.log(`📊 Found ${adminUsersSnapshot.size} admin users in Firestore:`);
    
    if (adminUsersSnapshot.empty) {
      console.log('❌ No admin users found in Firestore');
    } else {
      adminUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        console.log(`✅ Admin User: ${userData.email || 'No email'} (ID: ${doc.id})`);
        console.log(`   - Role: ${userData.role}`);
        console.log(`   - Permissions: ${JSON.stringify(userData.permissions || {})}`);
        console.log('');
      });
    }
    
    // Also check Firebase Auth for users
    console.log('\n🔍 Checking Firebase Auth users...');
    const authUsers = await admin.auth().listUsers(10);
    
    console.log(`📊 Found ${authUsers.users.length} users in Firebase Auth:`);
    
    authUsers.users.forEach(user => {
      console.log(`👤 User: ${user.email || 'No email'} (UID: ${user.uid})`);
      console.log(`   - Email verified: ${user.emailVerified}`);
      console.log(`   - Disabled: ${user.disabled}`);
      console.log(`   - Custom claims: ${JSON.stringify(user.customClaims || {})}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  }
}

checkAdminUsers();
