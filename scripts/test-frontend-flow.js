// Test script to simulate frontend product update behavior
const jwt = require('jsonwebtoken');

async function testFrontendFlow() {
  try {
    console.log('=== Testing Frontend Product Update Flow ===');
    
    // Simulate the admin token that would be stored in localStorage
    const testToken = jwt.sign({
      id: 'test-admin-id',
      adminId: 'test-admin-id',
      username: 'admin',
      role: 'super_admin',
      permissions: ['manage_products', 'manage_orders', 'view_analytics'],
      type: 'admin'
    }, 'fallback-secret-change-in-production', { expiresIn: '24h' });
    
    // Test the exact API call that frontend would make for a product update WITHOUT image
    console.log('\n=== Test: Product update without image (should use JSON) ===');
    
    const updateData = {
      name: 'Triple Chocolate Brownies',
      description: 'The most amazing brownies ever made',
      price: 4.99,
      category: 'Cakes',
      stock: 15,
      featured: true,
      active: true
    };
    
    console.log('Sending JSON update data:', updateData);
    
    const response = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products/tCoclMciMbFfqspQIGV9', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + testToken
      },
      body: JSON.stringify(updateData)
    });
    
    const responseData = await response.json();
    console.log('API Response:', responseData);
    console.log('Status:', response.status);
    
    // Verify the update worked
    const admin = require('firebase-admin');
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
        projectId: 'dreamy-delights-882ff',
      });
    }
    
    const db = admin.firestore();
    const updatedDoc = await db.collection('products').doc('tCoclMciMbFfqspQIGV9').get();
    const updatedData = updatedDoc.data();
    
    console.log('\nUpdated product in database:');
    console.log({
      name: updatedData.name,
      description: updatedData.description,
      price: updatedData.price,
      category: updatedData.category,
      stock: updatedData.stock,
      featured: updatedData.featured,
      active: updatedData.active
    });
    
    console.log('\nFrontend flow test completed successfully!');
    
  } catch (error) {
    console.error('Error in frontend flow test:', error);
  }
}

testFrontendFlow();
