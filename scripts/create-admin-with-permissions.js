const admin = require('firebase-admin');

/**
 * Admin Creation with Permissions Script
 * 
 * This script creates admins ONLY in the Firestore 'admins' collection.
 * We no longer create Firebase Authentication users or store admin data in the 'users' collection.
 * This simplifies the admin creation process and keeps all admin data in one place.
 */

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

// Available permissions in the system
const AVAILABLE_PERMISSIONS = [
  'manage_products',
  'manage_orders', 
  'manage_users',
  'manage_testimonials',
  'manage_content',
  'view_analytics',
  'manage_settings',
  'manage_admins'
];

// Predefined role templates
const ROLE_TEMPLATES = {
  'super_admin': {
    description: 'Full system access with all permissions',
    permissions: AVAILABLE_PERMISSIONS
  },
  'manager': {
    description: 'Manager with most permissions except admin management',
    permissions: [
      'manage_products',
      'manage_orders',
      'manage_users', 
      'manage_testimonials',
      'manage_content',
      'view_analytics',
      'manage_settings'
    ]
  },
  'editor': {
    description: 'Content editor with limited permissions',
    permissions: [
      'manage_products',
      'manage_testimonials',
      'manage_content'
    ]
  },
  'support': {
    description: 'Customer support with order and user management',
    permissions: [
      'manage_orders',
      'manage_users',
      'view_analytics'
    ]
  },
  'analyst': {
    description: 'Analytics viewer with read-only access',
    permissions: [
      'view_analytics'
    ]
  }
};

/**
 * Create a new admin user with specified permissions
 * @param {Object} adminData - Admin user data
 * @param {string} adminData.email - Admin email
 * @param {string} adminData.password - Admin password (optional, will generate if not provided)
 * @param {string} adminData.username - Admin username
 * @param {string} adminData.displayName - Admin display name
 * @param {string} adminData.role - Admin role (super_admin, manager, editor, support, analyst, custom)
 * @param {Array<string>} adminData.customPermissions - Custom permissions (only used if role is 'custom')
 * @param {boolean} adminData.active - Whether admin is active (default: true)
 */
async function createAdmin(adminData) {
  const {
    email,
    password,
    username,
    displayName,
    role = 'editor',
    customPermissions = [],
    active = true
  } = adminData;

  try {
    console.log(`🔧 Creating admin: ${username} (${email})`);
    
    // Validate required fields
    if (!email || !username || !displayName) {
      throw new Error('Email, username, and displayName are required');
    }

    // Generate password if not provided
    const adminPassword = password || generatePassword();
    
    // Determine permissions based on role
    let permissions;
    if (role === 'custom') {
      // Validate custom permissions
      const invalidPermissions = customPermissions.filter(p => !AVAILABLE_PERMISSIONS.includes(p));
      if (invalidPermissions.length > 0) {
        throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }
      permissions = customPermissions;
    } else if (ROLE_TEMPLATES[role]) {
      permissions = ROLE_TEMPLATES[role].permissions;
    } else {
      throw new Error(`Invalid role: ${role}. Available roles: ${Object.keys(ROLE_TEMPLATES).join(', ')}, custom`);
    }

    // We'll generate or look up an admin ID

    // Check if an admin with this username already exists
    const existingAdmins = await db.collection('admins')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    let adminId;
    if (!existingAdmins.empty) {
      // Update existing admin
      adminId = existingAdmins.docs[0].id;
      console.log(`✅ Updating existing admin with ID: ${adminId}`);
    } else {
      // Generate a new ID for the admin
      adminId = generateAdminId(username);
    }
    
    // Hash the password for storage
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin document in Firestore admins collection
    const adminDocData = {
      email: email,
      username: username,
      displayName: displayName,
      hashedPassword: hashedPassword, // Store hashed password for login
      role: role,
      permissions: permissions,
      active: active,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system', // Track who created this admin
      lastLogin: null,
      loginCount: 0
    };

    await db.collection('admins').doc(adminId).set(adminDocData, { merge: true });
    console.log('✅ Created/updated admin document in Firestore');

    return {
      success: true,
      admin: {
        id: adminId,
        email: email,
        username: username,
        displayName: displayName,
        role: role,
        permissions: permissions,
        password: adminPassword,
        active: active
      }
    };

  } catch (error) {
    console.error(`❌ Error creating admin ${username}:`, error.message);
    return {
      success: false,
      error: error.message
    };
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
 * Generate an admin ID from username and timestamp
 */
function generateAdminId(username) {
  // Create an ID combining username and timestamp
  const timestamp = Date.now();
  const randomChars = Math.random().toString(36).substring(2, 7);
  return `${username}-${timestamp}-${randomChars}`;
}

/**
 * List all available role templates
 */
function listRoleTemplates() {
  console.log('\n📋 Available Role Templates:');
  console.log('=' .repeat(50));
  
  Object.entries(ROLE_TEMPLATES).forEach(([roleName, roleData]) => {
    console.log(`\n🔹 ${roleName.toUpperCase()}`);
    console.log(`   Description: ${roleData.description}`);
    console.log(`   Permissions: ${roleData.permissions.join(', ')}`);
  });
  
  console.log(`\n🔹 CUSTOM`);
  console.log(`   Description: Custom role with manually selected permissions`);
  console.log(`   Available permissions: ${AVAILABLE_PERMISSIONS.join(', ')}`);
}

/**
 * Bulk create multiple admins
 */
async function createMultipleAdmins(adminsList) {
  console.log(`\n🚀 Creating ${adminsList.length} admins...`);
  const results = [];
  
  for (const adminData of adminsList) {
    const result = await createAdmin(adminData);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Successfully created admin: ${adminData.username}`);
    } else {
      console.log(`❌ Failed to create admin: ${adminData.username} - ${result.error}`);
    }
  }
  
  return results;
}

/**
 * Main function - you can modify this to create your desired admins
 */
async function main() {
  try {
    console.log('🎯 Admin Creation Script');
    console.log('=' .repeat(50));
    
    // Show available role templates
    listRoleTemplates();
    
    console.log('\n🔧 Creating Sample Admins...');
    console.log('=' .repeat(50));

    // Example: Create different types of admins
    const adminsToCreate = [
      {
        email: 'manager@dreamydelights.com',
        username: 'manager',
        displayName: 'Store Manager',
        role: 'manager',
        password: 'manager123' // Optional: will generate if not provided
      },
      {
        email: 'editor@dreamydelights.com', 
        username: 'content_editor',
        displayName: 'Content Editor',
        role: 'editor'
      },
      {
        email: 'support@dreamydelights.com',
        username: 'support_agent',
        displayName: 'Support Agent', 
        role: 'support'
      },
      {
        email: 'analyst@dreamydelights.com',
        username: 'data_analyst',
        displayName: 'Data Analyst',
        role: 'analyst'
      },
      {
        email: 'custom.admin@dreamydelights.com',
        username: 'custom_admin',
        displayName: 'Custom Admin',
        role: 'custom',
        customPermissions: ['manage_products', 'manage_orders', 'view_analytics']
      }
    ];

    // Create the admins
    const results = await createMultipleAdmins(adminsToCreate);
    
    // Summary
    console.log('\n📊 Creation Summary:');
    console.log('=' .repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully created: ${successful.length} admins`);
    console.log(`❌ Failed to create: ${failed.length} admins`);
    
    if (successful.length > 0) {
      console.log('\n🔑 Login Credentials:');
      successful.forEach(result => {
        const admin = result.admin;
        console.log(`\n👤 ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${admin.password}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Permissions: ${admin.permissions.join(', ')}`);
      });
    }
    
    console.log('\n🎉 Admin creation completed!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Export functions for use in other scripts
module.exports = {
  createAdmin,
  createMultipleAdmins,
  listRoleTemplates,
  generateAdminId,
  generatePassword,
  AVAILABLE_PERMISSIONS,
  ROLE_TEMPLATES
};

// Run the script if called directly
if (require.main === module) {
  main().then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}
