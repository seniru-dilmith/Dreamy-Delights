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

const db = admin.firestore();

/**
 * List all admins in the system
 */
async function listAdmins() {
  try {
    console.log('👥 Listing all admins...');
    console.log('=' .repeat(60));
    
    const adminsSnapshot = await db.collection('admins').get();
    
    if (adminsSnapshot.empty) {
      console.log('❌ No admins found in the system.');
      return [];
    }
    
    const admins = [];
    
    adminsSnapshot.forEach(doc => {
      const adminData = doc.data();
      admins.push({
        id: doc.id,
        ...adminData
      });
    });
    
    // Sort by creation date
    admins.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    
    console.log(`📊 Found ${admins.length} admin(s):\n`);
    
    admins.forEach((adminData, index) => {
      const status = adminData.active ? '🟢 Active' : '🔴 Inactive';
      const createdAt = adminData.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown';
      const lastLogin = adminData.lastLogin ? new Date(adminData.lastLogin).toLocaleDateString() : 'Never';
      
      console.log(`${index + 1}. ${adminData.username} (${adminData.displayName})`);
      console.log(`   📧 Email: ${adminData.email}`);
      console.log(`   🔹 Role: ${adminData.role}`);
      console.log(`   ${status}`);
      console.log(`   📅 Created: ${createdAt}`);
      console.log(`   🔐 Last Login: ${lastLogin}`);
      const permissions = adminData.permissions;
      let permissionsList = 'None';
      if (permissions) {
        if (Array.isArray(permissions)) {
          permissionsList = permissions.join(', ');
        } else if (typeof permissions === 'object') {
          permissionsList = Object.entries(permissions)
            .filter(([key, value]) => value === true)
            .map(([key]) => key)
            .join(', ');
        } else {
          permissionsList = String(permissions);
        }
      }
      console.log(`   🎯 Permissions: ${permissionsList}`);
      console.log(`   🆔 UID: ${adminData.uid || adminData.id}`);
      console.log('');
    });
    
    return admins;
    
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
    return [];
  }
}

/**
 * Get admin by email or username
 */
async function getAdmin(identifier) {
  try {
    const adminsSnapshot = await db.collection('admins')
      .where('email', '==', identifier)
      .get();
    
    if (!adminsSnapshot.empty) {
      const doc = adminsSnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    // Try by username
    const usernameSnapshot = await db.collection('admins')
      .where('username', '==', identifier)
      .get();
    
    if (!usernameSnapshot.empty) {
      const doc = usernameSnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Error getting admin:', error.message);
    return null;
  }
}

/**
 * Update admin permissions
 */
async function updateAdminPermissions(identifier, newPermissions) {
  try {
    const adminData = await getAdmin(identifier);
    
    if (!adminData) {
      throw new Error(`Admin with identifier '${identifier}' not found`);
    }
    
    // Update Firestore document only - no Firebase Auth
    await db.collection('admins').doc(adminData.id).update({
      permissions: newPermissions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Updated permissions for admin: ${adminData.username}`);
    console.log(`🎯 New permissions: ${newPermissions.join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating admin permissions:', error.message);
    return false;
  }
}

/**
 * Activate or deactivate admin
 */
async function toggleAdminStatus(identifier, active = true) {
  try {
    const adminData = await getAdmin(identifier);
    
    if (!adminData) {
      throw new Error(`Admin with identifier '${identifier}' not found`);
    }
    
    // Update Firestore document only - no Firebase Auth
    await db.collection('admins').doc(adminData.id).update({
      active: active,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const status = active ? 'activated' : 'deactivated';
    console.log(`✅ Successfully ${status} admin: ${adminData.username}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error updating admin status:`, error.message);
    return false;
  }
}

/**
 * Delete admin (soft delete by deactivating)
 */
async function deleteAdmin(identifier, permanent = false) {
  try {
    const adminData = await getAdmin(identifier);
    
    if (!adminData) {
      throw new Error(`Admin with identifier '${identifier}' not found`);
    }
    
    if (permanent) {
      // Hard delete - remove from Firestore only
      await db.collection('admins').doc(adminData.id).delete();
      console.log(`🗑️  Permanently deleted admin: ${adminData.username}`);
    } else {
      // Soft delete - just deactivate
      await toggleAdminStatus(identifier, false);
      console.log(`🔒 Soft deleted (deactivated) admin: ${adminData.username}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error deleting admin:', error.message);
    return false;
  }
}

/**
 * Reset admin password
 */
async function resetAdminPassword(identifier, newPassword = null) {
  try {
    const adminData = await getAdmin(identifier);
    
    if (!adminData) {
      throw new Error(`Admin with identifier '${identifier}' not found`);
    }
    
    // Generate password if not provided
    if (!newPassword) {
      newPassword = generatePassword();
    }
    
    // Hash the password before storing
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update Firestore document with new hashed password
    await db.collection('admins').doc(adminData.id).update({
      hashedPassword: hashedPassword,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`🔑 Password reset for admin: ${adminData.username}`);
    console.log(`🔒 New password: ${newPassword}`);
    
    return { success: true, password: newPassword };
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate a random password
 */
function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Get admin statistics
 */
async function getAdminStats() {
  try {
    const adminsSnapshot = await db.collection('admins').get();
    const admins = [];
    
    adminsSnapshot.forEach(doc => {
      admins.push(doc.data());
    });
    
    const total = admins.length;
    const active = admins.filter(a => a.active).length;
    const inactive = total - active;
    
    const roleStats = {};
    admins.forEach(admin => {
      roleStats[admin.role] = (roleStats[admin.role] || 0) + 1;
    });
    
    console.log('📊 Admin Statistics:');
    console.log('=' .repeat(30));
    console.log(`👥 Total Admins: ${total}`);
    console.log(`🟢 Active: ${active}`);
    console.log(`🔴 Inactive: ${inactive}`);
    console.log('\n📋 Role Distribution:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
    return {
      total,
      active,
      inactive,
      roleStats
    };
    
  } catch (error) {
    console.error('❌ Error getting admin stats:', error.message);
    return null;
  }
}

// Export functions
module.exports = {
  listAdmins,
  getAdmin,
  updateAdminPermissions,
  toggleAdminStatus,
  deleteAdmin,
  resetAdminPassword,
  getAdminStats
};

// CLI functionality
if (require.main === module) {
  const command = process.argv[2];
  const identifier = process.argv[3];
  
  async function runCommand() {
    switch (command) {
      case 'list':
        await listAdmins();
        break;
        
      case 'stats':
        await getAdminStats();
        break;
        
      case 'get':
        if (!identifier) {
          console.log('❌ Please provide admin email or username');
          return;
        }
        const admin = await getAdmin(identifier);
        if (admin) {
          console.log('👤 Admin Details:');
          console.log(JSON.stringify(admin, null, 2));
        } else {
          console.log(`❌ Admin '${identifier}' not found`);
        }
        break;
        
      case 'activate':
        if (!identifier) {
          console.log('❌ Please provide admin email or username');
          return;
        }
        await toggleAdminStatus(identifier, true);
        break;
        
      case 'deactivate':
        if (!identifier) {
          console.log('❌ Please provide admin email or username');
          return;
        }
        await toggleAdminStatus(identifier, false);
        break;
        
      case 'reset-password':
        if (!identifier) {
          console.log('❌ Please provide admin email or username');
          return;
        }
        await resetAdminPassword(identifier);
        break;
        
      default:
        console.log('🎯 Admin Management Script');
        console.log('=' .repeat(40));
        console.log('Usage: node manage-admins.js <command> [identifier]');
        console.log('\nCommands:');
        console.log('  list               - List all admins');
        console.log('  stats              - Show admin statistics');
        console.log('  get <identifier>   - Get admin details');
        console.log('  activate <id>      - Activate admin');
        console.log('  deactivate <id>    - Deactivate admin');
        console.log('  reset-password <id> - Reset admin password');
        console.log('\nIdentifier can be email or username');
    }
  }
  
  runCommand().then(() => {
    console.log('\n✨ Command completed!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Command failed:', error);
    process.exit(1);
  });
}
