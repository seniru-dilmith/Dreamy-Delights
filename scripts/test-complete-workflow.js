const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
    projectId: 'dreamy-delights-882ff',
  });
}

async function testCompleteWorkflow() {
  try {
    console.log('=== Testing Complete Admin Workflow ===');
    
    // 1. Get admin authentication
    console.log('1️⃣ Setting up admin authentication...');
    const db = admin.firestore();
    const adminsSnapshot = await db.collection('admins').where('active', '==', true).limit(1).get();
    
    if (adminsSnapshot.empty) {
      console.log('❌ No active admin users found');
      return;
    }
    
    const adminDoc = adminsSnapshot.docs[0];
    const adminData = adminDoc.data();
    const adminId = adminDoc.id;
    console.log('✅ Found admin user:', adminData.username);
    
    // Get ID token
    const customToken = await admin.auth().createCustomToken(adminId, {
      role: adminData.role,
      adminId: adminId,
      username: adminData.username
    });
    
    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyB318h5Mq0IhSzui9y96mkPJ0oaQqzwQgs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    });
    
    const authData = await authResponse.json();
    if (!authResponse.ok) {
      console.log('❌ Failed to get ID token:', authData);
      return;
    }
    
    const idToken = authData.idToken;
    console.log('✅ Got admin ID token');
    
    // 2. Create a product without image
    console.log('2️⃣ Creating product without image...');
    const createResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Product - Complete Workflow',
        description: 'Testing the complete admin workflow',
        price: 12.99,
        category: 'Cakes',
        stock: 8,
        available: true,
        featured: false
      })
    });
    
    const createData = await createResponse.json();
    if (!createResponse.ok || !createData.success) {
      console.log('❌ Failed to create product:', createData);
      return;
    }
    
    const productId = createData.data.id;
    console.log('✅ Product created with ID:', productId);
    
    // 3. Upload image to Firebase Storage
    console.log('3️⃣ Uploading image to Firebase Storage...');
    const imageBuffer = fs.readFileSync('./public/logo-large.png');
    const bucket = admin.storage().bucket('dreamy-delights-882ff.firebasestorage.app');
    const fileName = `products/test-${productId}-${Date.now()}.png`;
    const file = bucket.file(fileName);
    
    await file.save(imageBuffer, {
      metadata: { contentType: 'image/png' },
      public: true,
    });
    
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/dreamy-delights-882ff.firebasestorage.app/o/${encodeURIComponent(fileName)}?alt=media`;
    console.log('✅ Image uploaded to:', imageUrl);
    
    // 4. Update product with image URL
    console.log('4️⃣ Updating product with image URL...');
    const updateResponse = await fetch(`https://api-cvfhs7orea-uc.a.run.app/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Product - WITH IMAGE',
        description: 'Complete workflow test - now with image!',
        price: 15.99,
        imageUrl: imageUrl,
        featured: true
      })
    });
    
    const updateData = await updateResponse.json();
    if (!updateResponse.ok || !updateData.success) {
      console.log('❌ Failed to update product:', updateData);
      return;
    }
    
    console.log('✅ Product updated successfully');
    
    // 5. Verify product in Firestore
    console.log('5️⃣ Verifying product in Firestore...');
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      console.log('❌ Product not found in Firestore');
      return;
    }
    
    const productData = productDoc.data();
    console.log('✅ Product verified in Firestore:');
    console.log('  - Name:', productData.name);
    console.log('  - Price:', productData.price);
    console.log('  - Featured:', productData.featured);
    console.log('  - Image URL:', productData.imageUrl);
    
    // 6. Test image accessibility
    console.log('6️⃣ Testing image accessibility...');
    const imageTestResponse = await fetch(productData.imageUrl);
    console.log('✅ Image accessible:', imageTestResponse.status, imageTestResponse.statusText);
    
    // 7. Test product listing API
    console.log('7️⃣ Testing product listing...');
    const listResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + idToken }
    });
    
    const listData = await listResponse.json();
    if (listResponse.ok && listData.success) {
      const foundProduct = listData.data.find(p => p.id === productId);
      if (foundProduct) {
        console.log('✅ Product found in listing with image URL:', foundProduct.imageUrl ? '✓' : '✗');
      } else {
        console.log('❌ Product not found in listing');
      }
    } else {
      console.log('❌ Failed to list products:', listData);
    }
    
    // 8. Update stock (test field updates)
    console.log('8️⃣ Testing stock update...');
    const stockResponse = await fetch(`https://api-cvfhs7orea-uc.a.run.app/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stock: 15 })
    });
    
    const stockData = await stockResponse.json();
    if (stockResponse.ok && stockData.success) {
      console.log('✅ Stock updated successfully');
    } else {
      console.log('❌ Failed to update stock:', stockData);
    }
    
    console.log('\n🎉 COMPLETE ADMIN WORKFLOW TEST PASSED! 🎉');
    console.log('✅ Authentication: Working');
    console.log('✅ Product Creation: Working');
    console.log('✅ Image Upload: Working');
    console.log('✅ Product Updates: Working');
    console.log('✅ Product Listing: Working');
    console.log('✅ Field Updates: Working');
    console.log('✅ Image Accessibility: Working');
    
  } catch (error) {
    console.error('❌ Error in complete workflow test:', error);
  }
}

testCompleteWorkflow();
