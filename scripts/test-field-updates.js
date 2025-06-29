const admin = require('firebase-admin');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
    projectId: 'dreamy-delights-882ff',
  });
}

const db = admin.firestore();

async function testFieldUpdates() {
  try {
    console.log('=== Testing Field Updates ===');
    
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
      description: productData.description,
      price: productData.price,
      category: productData.category,
      stock: productData.stock,
      featured: productData.featured,
      active: productData.active
    });
    
    // Test 1: Update name
    console.log('\n=== Test 1: Update name ===');
    const nameUpdateData = {
      name: 'Super Double Chocolate Brownies'
    };
    
    console.log('Update data:', nameUpdateData);
    
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({
      id: 'test-admin-id',
      adminId: 'test-admin-id',
      username: 'admin',
      role: 'super_admin',
      permissions: ['manage_products', 'manage_orders', 'view_analytics'],
      type: 'admin'
    }, 'fallback-secret-change-in-production', { expiresIn: '24h' });
    
    const nameResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products/' + productId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + testToken
      },
      body: JSON.stringify(nameUpdateData)
    });
    
    const nameResponseData = await nameResponse.json();
    console.log('Name update API Response:', nameResponseData);
    console.log('Status:', nameResponse.status);
    
    // Check if the name was actually updated
    let updatedDoc = await db.collection('products').doc(productId).get();
    let updatedData = updatedDoc.data();
    console.log('Updated name in database:', updatedData.name);
    
    // Test 2: Update price
    console.log('\n=== Test 2: Update price ===');
    const priceUpdateData = {
      price: 3.49
    };
    
    console.log('Update data:', priceUpdateData);
    
    const priceResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products/' + productId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + testToken
      },
      body: JSON.stringify(priceUpdateData)
    });
    
    const priceResponseData = await priceResponse.json();
    console.log('Price update API Response:', priceResponseData);
    console.log('Status:', priceResponse.status);
    
    // Check if the price was actually updated
    updatedDoc = await db.collection('products').doc(productId).get();
    updatedData = updatedDoc.data();
    console.log('Updated price in database:', updatedData.price);
    
    // Test 3: Update description
    console.log('\n=== Test 3: Update description ===');
    const descriptionUpdateData = {
      description: 'Ultra-fudgy brownies with extra chocolate chips and a rich chocolate drizzle'
    };
    
    console.log('Update data:', descriptionUpdateData);
    
    const descResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products/' + productId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + testToken
      },
      body: JSON.stringify(descriptionUpdateData)
    });
    
    const descResponseData = await descResponse.json();
    console.log('Description update API Response:', descResponseData);
    console.log('Status:', descResponse.status);
    
    // Check if the description was actually updated
    updatedDoc = await db.collection('products').doc(productId).get();
    updatedData = updatedDoc.data();
    console.log('Updated description in database:', updatedData.description);
    
    // Test 4: Update category
    console.log('\n=== Test 4: Update category ===');
    const categoryUpdateData = {
      category: 'Desserts'
    };
    
    console.log('Update data:', categoryUpdateData);
    
    const catResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products/' + productId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + testToken
      },
      body: JSON.stringify(categoryUpdateData)
    });
    
    const catResponseData = await catResponse.json();
    console.log('Category update API Response:', catResponseData);
    console.log('Status:', catResponse.status);
    
    // Check if the category was actually updated
    updatedDoc = await db.collection('products').doc(productId).get();
    updatedData = updatedDoc.data();
    console.log('Updated category in database:', updatedData.category);
    
    console.log('\n=== Final product state ===');
    console.log('Final product data:', {
      id: productId,
      name: updatedData.name,
      description: updatedData.description,
      price: updatedData.price,
      category: updatedData.category,
      stock: updatedData.stock,
      featured: updatedData.featured,
      active: updatedData.active
    });
    
    console.log('\nField updates test completed');
    
  } catch (error) {
    console.error('Error in field updates test:', error);
  }
}

testFieldUpdates();
