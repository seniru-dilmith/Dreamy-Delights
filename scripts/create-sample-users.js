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

const sampleUsers = [
  {
    id: 'sample-user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    status: 'active',
    displayName: 'John Doe',
    createdAt: new Date('2024-01-15').toISOString(),
    lastLoginAt: new Date('2024-12-01').toISOString(),
    totalOrders: 5,
    totalSpent: 125.50,
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    }
  },
  {
    id: 'sample-user-2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'customer',
    status: 'active',
    displayName: 'Jane Smith',
    createdAt: new Date('2024-02-20').toISOString(),
    lastLoginAt: new Date('2024-11-28').toISOString(),
    totalOrders: 12,
    totalSpent: 289.75,
    phone: '+1987654321',
    address: {
      street: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL', 
      zipCode: '62702'
    }
  },
  {
    id: 'sample-user-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'customer',
    status: 'suspended',
    displayName: 'Mike Johnson',
    createdAt: new Date('2024-03-10').toISOString(),
    lastLoginAt: new Date('2024-10-15').toISOString(),
    totalOrders: 2,
    totalSpent: 45.00,
    phone: '+1555123456',
    address: {
      street: '789 Pine St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703'
    }
  },
  {
    id: 'sample-user-4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'editor',
    status: 'active',
    displayName: 'Sarah Wilson',
    createdAt: new Date('2024-01-05').toISOString(),
    lastLoginAt: new Date('2024-12-02').toISOString(),
    totalOrders: 8,
    totalSpent: 167.25,
    phone: '+1444567890',
    address: {
      street: '321 Elm St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704'
    }
  },
  {
    id: 'sample-user-5',
    name: 'David Brown',
    email: 'david@example.com',
    role: 'customer',
    status: 'banned',
    displayName: 'David Brown',
    createdAt: new Date('2024-05-15').toISOString(),
    lastLoginAt: new Date('2024-06-01').toISOString(),
    totalOrders: 1,
    totalSpent: 15.00,
    phone: '+1333456789',
    address: {
      street: '654 Maple Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62705'
    }
  }
];

async function createSampleUsers() {
  console.log('Creating sample users...');
  
  try {
    const batch = db.batch();
    
    sampleUsers.forEach(user => {
      const userRef = db.collection('users').doc(user.id);
      batch.set(userRef, user);
    });
    
    await batch.commit();
    console.log('Successfully created sample users!');
    
    // List all users to verify
    const snapshot = await db.collection('users').get();
    console.log(`Total users in database: ${snapshot.size}`);
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`- ${userData.name} (${userData.email}) - ${userData.role} - ${userData.status}`);
    });
    
  } catch (error) {
    console.error('Error creating sample users:', error);
  }
}

// Run the script
createSampleUsers().then(() => {
  console.log('Script completed!');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
