const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
    projectId: 'dreamy-delights-882ff',
  });
}

async function testWithCustomToken() {
  try {
    console.log('=== Testing Image Upload with Custom Token ===');
    
    // Create a custom token for admin user
    const adminUserId = 'admin-test-' + Date.now();
    const customToken = await admin.auth().createCustomToken(adminUserId, {
      role: 'admin',
      adminId: adminUserId
    });
    
    console.log('✅ Created custom token for admin user:', adminUserId);
    
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
        'Authorization': 'Bearer ' + customToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simpleProductData)
    });
    
    const createResponseData = await createResponse.json();
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
        'Authorization': 'Bearer ' + customToken,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log('📥 Update response status:', updateResponse.status);
    
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
        }
        
        // Verify the product in Firestore
        const db = admin.firestore();
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
testWithCustomToken();
