const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dreamy-delights-882ff-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function createAdminInAdminsCollection() {
  try {
    console.log('👤 Creating admin in admins collection...');
    
    const username = 'admin';
    const password = 'admin123';
    const email = 'admin@dreamydelights.com';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin document
    const adminData = {
      username: username,
      email: email,
      hashedPassword: hashedPassword,
      role: 'admin',
      permissions: {
        manage_products: true,
        manage_orders: true,
        manage_users: true,
        manage_testimonials: true,
        view_analytics: true
      },
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    };
    
    // Check if admin already exists
    const existingAdmin = await db.collection('admins')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    if (!existingAdmin.empty) {
      console.log('📧 Admin already exists, updating...');
      const adminDoc = existingAdmin.docs[0];
      await adminDoc.ref.update({
        hashedPassword: hashedPassword,
        permissions: adminData.permissions,
        active: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Updated existing admin');
    } else {
      // Create new admin
      const docRef = await db.collection('admins').add(adminData);
      console.log('✅ Created new admin with ID:', docRef.id);
    }
    
    console.log('\n🎉 Admin created/updated in admins collection!');
    console.log('👤 Username:', username);
    console.log('🔑 Password:', password);
    console.log('📧 Email:', email);
    console.log('\n💡 You can now use these credentials to login via the admin API.');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdminInAdminsCollection();
