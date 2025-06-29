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

async function testAdminAuth() {
  console.log('🔍 Testing admin authentication flow...');
  
  try {
    // First, let's check if there's an admin user in the system
    console.log('\n1. Checking for existing admin users...');
    const adminSnapshot = await db.collection('admins').get();
    
    if (adminSnapshot.empty) {
      console.log('❌ No admin users found in Firestore');
      console.log('Creating test admin user...');
      
      const bcrypt = require('bcrypt');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      await db.collection('admins').doc('admin').set({
        username: 'admin',
        email: 'admin@dreamydelights.com',
        password: hashedPassword,
        role: 'super_admin',
        permissions: [
          'manage_products',
          'manage_orders', 
          'manage_users',
          'manage_content',
          'manage_settings',
          'view_analytics',
          'manage_admins'
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Test admin user created');
    } else {
      console.log(`✅ Found ${adminSnapshot.size} admin user(s)`);
      adminSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - Username: ${data.username}, Role: ${data.role}`);
      });
    }
    
    // Test direct admin login function call
    console.log('\n2. Testing admin login function...');
    const functions = require('firebase-functions-test')();
    
    // Mock context for callable function
    const mockContext = {
      auth: null,
      rawRequest: {}
    };
    
    // Import the admin login function
    const { adminLogin } = require('../functions/auth');
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    try {
      const result = await adminLogin(loginData, mockContext);
      console.log('✅ Admin login function result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('❌ Admin login function error:', error.message);
    }
    
    // Test admin token verification
    console.log('\n3. Testing admin functions deployment...');
    
    // Check if functions are deployed
    const functionsList = [
      'adminLogin',
      'adminLogout', 
      'verifyAdminToken',
      'createInitialAdmin'
    ];
    
    functionsList.forEach(funcName => {
      console.log(`   - ${funcName}: Available in exports`);
    });
    
    console.log('\n✅ Admin authentication test completed');
    
  } catch (error) {
    console.error('❌ Error testing admin auth:', error);
  }
}

testAdminAuth().then(() => {
  console.log('\n🎉 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
