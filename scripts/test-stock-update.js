const admin = require('firebase-admin');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
    projectId: 'dreamy-delights-882ff',
  });
}

const db = admin.firestore();

async function testStockUpdate() {
  try {
    console.log('=== Testing Stock Update ===');
    
    // Find "Double Chocolate Brownies" in the database
    const snapshot = await db.collection('products')
      .where('name', '==', 'Double Chocolate Brownies')
      .get();
    
    if (snapshot.empty) {
      console.log('Product "Double Chocolate Brownies" not found');
      return;
    }
    
    const productDoc = snapshot.docs[0];
    const productData = productDoc.data();
    const productId = productDoc.id;
    
    console.log('Current product data:', {
      id: productId,
      name: productData.name,
      stock: productData.stock,
      price: productData.price,
      featured: productData.featured,
      active: productData.active
    });
    
    // Test updating stock via the API
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({
      id: 'test-admin-id',
      adminId: 'test-admin-id',
      username: 'admin',
      role: 'super_admin',
      permissions: ['manage_products', 'manage_orders', 'view_analytics'],
      type: 'admin'
    }, 'fallback-secret-change-in-production', { expiresIn: '24h' });
    
    const updateData = {
      stock: 3  // New stock value
    };
    
    console.log('\nTesting stock update via API...');
    console.log('Update data:', updateData);
    
    const response = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products/' + productId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + testToken
      },
      body: JSON.stringify(updateData)
    });
    
    const responseData = await response.json();
    console.log('\nAPI Response:', responseData);
    console.log('Status:', response.status);
    
    // Check if the stock was actually updated in the database
    const updatedDoc = await db.collection('products').doc(productId).get();
    const updatedData = updatedDoc.data();
    
    console.log('\nUpdated product data in database:', {
      id: productId,
      name: updatedData.name,
      stock: updatedData.stock,
      price: updatedData.price,
      featured: updatedData.featured,
      active: updatedData.active
    });
    
    console.log('\nStock update test completed');
    
  } catch (error) {
    console.error('Error in stock update test:', error);
  }
}

testStockUpdate();
