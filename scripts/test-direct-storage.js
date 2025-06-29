const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
    projectId: 'dreamy-delights-882ff',
  });
}

async function testBrowserStyleFormData() {
  try {
    console.log('=== Testing Browser-Style FormData with Real Auth ===');
    
    // Get an existing admin user from Firestore
    const db = admin.firestore();
    const adminsSnapshot = await db.collection('admins').where('active', '==', true).limit(1).get();
    
    if (adminsSnapshot.empty) {
      console.log('❌ No active admin users found');
      return;
    }
    
    const adminDoc = adminsSnapshot.docs[0];
    const adminData = adminDoc.data();
    const adminId = adminDoc.id;
    
    console.log('✅ Found admin user:', adminData.username, 'with ID:', adminId);
    
    // Create a custom token for this admin user
    const customToken = await admin.auth().createCustomToken(adminId, {
      role: adminData.role,
      adminId: adminId,
      username: adminData.username
    });
    
    // Exchange custom token for ID token
    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=REDACTED_API_KEY`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true
      })
    });
    
    const authData = await authResponse.json();
    if (!authResponse.ok) {
      console.log('❌ Failed to get ID token:', authData);
      return;
    }
    
    const idToken = authData.idToken;
    console.log('✅ Got ID token');
    
    // First create a product
    console.log('📄 Creating test product...');
    
    const createResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Product for Simple Upload',
        description: 'Testing simple image upload',
        price: 7.99,
        category: 'Cakes',
        stock: 3,
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
    
    // Now try a simple approach: upload to Firebase Storage directly, then update product with URL
    console.log('📸 Testing direct Firebase Storage upload...');
    
    const imageBuffer = fs.readFileSync('./public/logo-large.png');
    console.log('📁 Read image, size:', imageBuffer.length, 'bytes');
    
    // Upload directly to Firebase Storage
    const bucket = admin.storage().bucket('dreamy-delights-882ff.firebasestorage.app');
    const fileName = `products/${productId}-${Date.now()}.png`;
    const file = bucket.file(fileName);
    
    console.log('📤 Uploading to Firebase Storage as:', fileName);
    
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/png',
      },
      public: true,
    });
    
    // Get the public URL
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/dreamy-delights-882ff.firebasestorage.app/o/${encodeURIComponent(fileName)}?alt=media`;
    console.log('🔗 Public URL:', publicUrl);
    
    // Now update the product with the image URL using JSON
    console.log('📝 Updating product with image URL...');
    
    const updateResponse = await fetch(`https://api-cvfhs7orea-uc.a.run.app/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Product WITH Direct Upload Image',
        description: 'Image uploaded directly to Firebase Storage',
        imageUrl: publicUrl
      })
    });
    
    const updateData = await updateResponse.json();
    console.log('Update response:', updateData);
    
    if (updateResponse.ok && updateData.success) {
      console.log('✅ Product updated with image URL!');
      console.log('🖼️ Final image URL:', updateData.data.imageUrl);
      
      // Test if the image is accessible
      const imageTest = await fetch(updateData.data.imageUrl);
      console.log('🔗 Image accessibility test:', imageTest.status, imageTest.statusText);
      
      if (imageTest.ok) {
        console.log('🎉 END-TO-END IMAGE UPLOAD TEST PASSED (DIRECT STORAGE)!');
      }
    } else {
      console.log('❌ Failed to update product with image URL:', updateData);
    }
    
  } catch (error) {
    console.error('❌ Error in direct storage test:', error);
  }
}

testBrowserStyleFormData();
