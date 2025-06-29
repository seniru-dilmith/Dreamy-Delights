const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
    projectId: 'dreamy-delights-882ff',
  });
}

async function testWithDirectAdmin() {
  try {
    console.log('=== Testing Image Upload with Direct Admin User ===');
    
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
    
    // Simulate exchanging custom token for ID token using Firebase Auth REST API
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyB318h5Mq0IhSzui9y96mkPJ0oaQqzwQgs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true
      })
    });
    
    const authData = await response.json();
    
    if (!response.ok) {
      console.log('❌ Failed to exchange custom token for ID token:', authData);
      return;
    }
    
    const idToken = authData.idToken;
    console.log('✅ Got ID token, length:', idToken.length);
    
    // First create a product without image
    const simpleProductData = {
      name: 'Test Product for Image Upload',
      description: 'This product will get an image',
      price: 9.99,
      category: 'Cakes',
      stock: 5,
      available: true,
      featured: false
    };
    
    console.log('📄 Creating product without image first...');
    
    const createResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simpleProductData)
    });
    
    console.log('Create response status:', createResponse.status);
    console.log('Create response headers:', Object.fromEntries(createResponse.headers.entries()));
    
    const createResponseText = await createResponse.text();
    console.log('Create response text (first 500 chars):', createResponseText.substring(0, 500));
    
    let createResponseData;
    try {
      createResponseData = JSON.parse(createResponseText);
    } catch (parseError) {
      console.log('❌ Failed to parse create response as JSON:', parseError.message);
      console.log('Full response:', createResponseText);
      return;
    }
    
    console.log('Product creation response:', createResponseData);
    
    if (!createResponse.ok || !createResponseData.success) {
      console.log('❌ Failed to create initial product');
      return;
    }
    
    const productId = createResponseData.data.id;
    console.log('✅ Product created with ID:', productId);
    
    // Now test image upload using browser-style FormData
    console.log('📸 Testing image upload via FormData...');
    
    // Read the test image
    const testImagePath = './public/logo-large.png';
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found at:', testImagePath);
      return;
    }
    
    const imageBuffer = fs.readFileSync(testImagePath);
    console.log('📁 Read image file, size:', imageBuffer.length, 'bytes');
    
    // Use form-data package for multipart/form-data
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('name', 'Test Product WITH Image');
    formData.append('description', 'This product now has an image!');
    formData.append('price', '12.99');
    formData.append('image', imageBuffer, {
      filename: 'test-product-image.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Sending FormData to update product...');
    
    const updateResponse = await fetch(`https://api-cvfhs7orea-uc.a.run.app/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + idToken,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log('📥 Update response status:', updateResponse.status);
    console.log('📥 Update response headers:', Object.fromEntries(updateResponse.headers.entries()));
    
    const responseText = await updateResponse.text();
    console.log('📥 Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    if (updateResponse.ok) {
      try {
        const updateResponseData = JSON.parse(responseText);
        console.log('✅ Product updated with image successfully!');
        
        // Check if imageUrl was set
        if (updateResponseData.data && updateResponseData.data.imageUrl) {
          console.log('🖼️ Image URL saved:', updateResponseData.data.imageUrl);
          
          // Test if the image URL is accessible
          const imageTestResponse = await fetch(updateResponseData.data.imageUrl);
          console.log('🔗 Image accessibility test:', imageTestResponse.status, imageTestResponse.statusText);
          
          if (imageTestResponse.ok) {
            console.log('✅ Image is accessible via the URL!');
          } else {
            console.log('❌ Image is not accessible via the URL');
          }
        } else {
          console.log('⚠️ No imageUrl in response data');
          console.log('📋 Full response data:', updateResponseData);
        }
        
        // Verify the product in Firestore
        const productDoc = await db.collection('products').doc(productId).get();
        
        if (productDoc.exists) {
          const productData = productDoc.data();
          console.log('✅ Product verified in Firestore:');
          console.log('  - Name:', productData.name);
          console.log('  - Description:', productData.description);
          console.log('  - Price:', productData.price);
          console.log('  - Image URL:', productData.imageUrl);
          
          if (productData.imageUrl) {
            console.log('✅ Image URL successfully saved to Firestore!');
            console.log('🎉 END-TO-END IMAGE UPLOAD TEST PASSED!');
          } else {
            console.log('❌ No image URL found in Firestore');
          }
        } else {
          console.log('❌ Product not found in Firestore');
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse response as JSON:', parseError.message);
        console.log('Raw response was:', responseText);
      }
    } else {
      console.log('❌ Update failed with status:', updateResponse.status);
      console.log('❌ Response:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Error in image upload test:', error);
  }
}

// Run the test
testWithDirectAdmin();
