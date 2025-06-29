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

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');
    
    const adminEmail = 'admin@dreamydelights.com';
    const adminPassword = 'admin123'; // For testing only
    
    // Create Firebase Auth user
    let adminUser;
    try {
      adminUser = await admin.auth().createUser({
        email: adminEmail,
        password: adminPassword,
        emailVerified: true,
        displayName: 'Admin User'
      });
      console.log(`✅ Created Firebase Auth user: ${adminUser.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('📧 User already exists, getting existing user...');
        adminUser = await admin.auth().getUserByEmail(adminEmail);
      } else {
        throw error;
      }
    }
    
    // Set custom claims for admin
    await admin.auth().setCustomUserClaims(adminUser.uid, {
      role: 'admin',
      permissions: {
        manage_products: true,
        manage_orders: true,
        manage_users: true,
        manage_testimonials: true,
        view_analytics: true
      }
    });
    console.log('✅ Set admin custom claims');
    
    // Create Firestore user document
    const userData = {
      email: adminEmail,
      role: 'admin',
      permissions: {
        manage_products: true,
        manage_orders: true,
        manage_users: true,
        manage_testimonials: true,
        view_analytics: true
      },
      displayName: 'Admin User',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(adminUser.uid).set(userData, { merge: true });
    console.log('✅ Created Firestore user document');
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 UID:', adminUser.uid);
    console.log('\n💡 You can now log in to the admin panel with these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();
