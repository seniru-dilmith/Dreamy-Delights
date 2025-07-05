const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dreamy-delights-882ff-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

// 📝 EDIT THIS ARRAY - Add your admins here
const ADMINS_TO_CREATE = [
  {
    username: 'testadmin',
    email: 'testadmin@dreamydelights.com',
    password: 'testpass123',
    role: 'admin',
    permissions: {
      manage_products: true,
      manage_orders: true,
      manage_users: true,
      manage_testimonials: true,
      manage_content: true,
      view_analytics: true,
      super_admin: true
    }
  },
];

/**
 * Generate a unique admin ID based on username and timestamp
 */
function generateAdminId(username) {
  const timestamp = Date.now();
  const randomChars = crypto.randomBytes(3).toString('hex');
  return `${username}-${timestamp}-${randomChars}`;
}

/**
 * Generate JWT token for an admin
 */
function generateJWT(adminData) {
  const permissionsArray = Object.entries(adminData.permissions || {})
    .filter(([key, value]) => value === true)
    .map(([key]) => key);

  const token = jwt.sign(
    {
      id: adminData.id,
      username: adminData.username,
      role: adminData.role,
      permissions: permissionsArray,
      type: 'admin',
    },
    process.env.ADMIN_JWT_SECRET || 'your-super-secure-jwt-secret-change-this-in-production',
    { expiresIn: '24h' }
  );

  return token;
}

async function createAdmins() {
  console.log('🚀 Creating Admins from Array');
  console.log('==============================');
  console.log(`📊 Total admins to create: ${ADMINS_TO_CREATE.length}\n`);

  const results = {
    created: 0,
    updated: 0,
    failed: 0,
    details: []
  };

  for (const adminConfig of ADMINS_TO_CREATE) {
    try {
      console.log(`👤 Processing: ${adminConfig.username}`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminConfig.password, 10);
      
      // Check if admin already exists
      const existingAdmin = await db.collection('admins')
        .where('username', '==', adminConfig.username)
        .limit(1)
        .get();
      
      if (!existingAdmin.empty) {
        // Update existing admin
        const adminDoc = existingAdmin.docs[0];
        await adminDoc.ref.update({
          email: adminConfig.email,
          hashedPassword: hashedPassword,
          role: adminConfig.role,
          permissions: adminConfig.permissions,
          active: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`   ✅ Updated existing admin: ${adminConfig.username}`);
        results.updated++;
        results.details.push({
          username: adminConfig.username,
          email: adminConfig.email,
          action: 'updated',
          role: adminConfig.role,
          id: adminDoc.id
        });
      } else {
        // Generate a unique ID for the new admin
        const adminId = generateAdminId(adminConfig.username);
        
        // Create admin document
        const adminData = {
          username: adminConfig.username,
          email: adminConfig.email,
          hashedPassword: hashedPassword,
          role: adminConfig.role,
          permissions: adminConfig.permissions,
          active: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: null,
          createdBy: 'batch-creation-script'
          // No Firebase Auth UID - we're not using Firebase Auth
        };
        
        // Create new admin using the generated ID
        await db.collection('admins').doc(adminId).set(adminData);
        console.log(`   ✅ Created new admin: ${adminConfig.username} (ID: ${adminId})`);
        results.created++;
        results.details.push({
          username: adminConfig.username,
          email: adminConfig.email,
          action: 'created',
          role: adminConfig.role,
          id: adminId
        });
      }
      
      // Show permissions
      const enabledPermissions = Object.entries(adminConfig.permissions)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
      console.log(`   🔐 Permissions: ${enabledPermissions.join(', ')}`);
      console.log('');
      
    } catch (error) {
      console.error(`   ❌ Failed to create ${adminConfig.username}:`, error.message);
      results.failed++;
      results.details.push({
        username: adminConfig.username,
        email: adminConfig.email,
        action: 'failed',
        error: error.message
      });
    }
  }

  // Show summary
  console.log('\n🎉 Admin Creation Summary');
  console.log('=========================');
  console.log(`✅ Created: ${results.created}`);
  console.log(`🔄 Updated: ${results.updated}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total processed: ${ADMINS_TO_CREATE.length}\n`);

  // Show login credentials
  console.log('🔑 Login Credentials:');
  console.log('=====================');
  results.details.forEach(admin => {
    if (admin.action === 'created' || admin.action === 'updated') {
      const config = ADMINS_TO_CREATE.find(a => a.username === admin.username);
      const adminData = {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        permissions: config.permissions
      };
      const jwtToken = generateJWT(adminData);
      
      console.log(`👤 ${admin.username}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🔑 Password: ${config.password}`);
      console.log(`   🎭 Role: ${admin.role}`);
      console.log(`   🎫 JWT Token: ${jwtToken}`);
      console.log('');
    }
  });

  console.log('💡 All admins can now login via the admin API using their credentials.');
}

// Run the script
createAdmins().then(() => {
  console.log('\n👋 Admin creation completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
