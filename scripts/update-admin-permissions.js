const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "dreamy-delights-882ff.firebasestorage.app",
  });
}

const db = admin.firestore();

async function updateAdminPermissions() {
  console.log('🔧 Updating admin permissions to include debug...');
  
  try {
    // Get all admin users
    const adminSnapshot = await db.collection('admins').get();
    
    if (adminSnapshot.empty) {
      console.log('❌ No admin users found');
      return;
    }
    
    const batch = db.batch();
    let updateCount = 0;
    
    adminSnapshot.forEach(doc => {
      const adminData = doc.data();
      const currentPermissions = adminData.permissions || [];
      
      // Add debug permission if not already present
      if (!currentPermissions.includes('debug')) {
        const updatedPermissions = [...currentPermissions, 'debug'];
        
        batch.update(doc.ref, {
          permissions: updatedPermissions,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        updateCount++;
        console.log(`✅ Will add debug permission to admin: ${adminData.username}`);
      } else {
        console.log(`ℹ️  Admin ${adminData.username} already has debug permission`);
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updateCount} admin user(s) with debug permission`);
    } else {
      console.log('ℹ️  No updates needed - all admins already have debug permission');
    }
    
  } catch (error) {
    console.error('❌ Error updating admin permissions:', error);
  }
}

updateAdminPermissions().then(() => {
  console.log('\n🎉 Admin permission update completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});
