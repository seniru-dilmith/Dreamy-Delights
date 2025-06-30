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

async function checkAdminsCollection() {
  try {
    console.log('🔍 Checking admins collection...');
    
    const adminsSnapshot = await db.collection('admins').get();
    
    console.log(`📊 Found ${adminsSnapshot.size} admin users in admins collection:`);
    
    if (adminsSnapshot.empty) {
      console.log('❌ No admin users found in admins collection');
    } else {
      adminsSnapshot.forEach(doc => {
        const adminData = doc.data();
        console.log(`✅ Admin: ${adminData.username} (ID: ${doc.id})`);
        console.log(`   - Email: ${adminData.email}`);
        console.log(`   - Role: ${adminData.role}`);
        console.log(`   - Active: ${adminData.active}`);
        console.log(`   - Permissions: ${JSON.stringify(adminData.permissions || {})}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking admins collection:', error);
  }
}

checkAdminsCollection();
