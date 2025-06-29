const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
    projectId: 'dreamy-delights-882ff',
  });
}

async function testImageUpload() {
  try {
    console.log('=== Testing Image Upload ===');
    
    // First, let's check if we have a test image file
    const testImagePath = './public/logo-large.png';
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found at:', testImagePath);
      console.log('Available files in public directory:');
      const files = fs.readdirSync('./public');
      console.log(files);
      return;
    }
    
    console.log('✅ Test image found at:', testImagePath);
    
    // Generate admin token
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({
      id: 'test-admin-id',
      adminId: 'test-admin-id',
      username: 'admin',
      role: 'super_admin',
      permissions: ['manage_products', 'manage_orders', 'view_analytics'],
      type: 'admin'
    }, 'fallback-secret-change-in-production', { expiresIn: '24h' });
    
    // Test with a simple product creation first (no image)
    console.log('📄 Testing product creation without image (JSON)...');
    
    const simpleProductData = {
      name: 'Test Product No Image',
      description: 'This is a test product without an image',
      price: 5.99,
      category: 'Cakes',
      stock: 10,
      featured: false,
      active: true
    };
    
    const simpleResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + testToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simpleProductData)
    });
    
    const simpleResponseData = await simpleResponse.json();
    console.log('Simple product creation response:', simpleResponseData);
    
    if (simpleResponse.ok && simpleResponseData.success) {
      console.log('✅ Simple product created successfully!');
      
      // Now test updating this product with an image
      const productId = simpleResponseData.data.id;
      console.log('📸 Testing image upload via product update...');
      
      // Create FormData for image upload using native FormData
      const { FormData } = await import('formdata-node');
      const { File } = await import('formdata-node/file');
      
      const formData = new FormData();
      formData.append('name', 'Test Product WITH Image');
      formData.append('description', 'This product now has an image');
      
      // Add the image file
      const imageBuffer = fs.readFileSync(testImagePath);
      const imageFile = new File([imageBuffer], 'test-product-image.png', {
        type: 'image/png'
      });
      formData.append('image', imageFile);
      
      console.log('Sending FormData update with image...');
      
      const updateResponse = await fetch(`https://api-cvfhs7orea-uc.a.run.app/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + testToken
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: formData
      });
      
      console.log('Update response status:', updateResponse.status);
      
      if (updateResponse.ok) {
        const updateResponseData = await updateResponse.json();
        console.log('✅ Product updated with image successfully!');
        console.log('Update response:', updateResponseData);
        
        // Verify the product was updated in Firestore
        const db = admin.firestore();
        const productDoc = await db.collection('products').doc(productId).get();
        
        if (productDoc.exists) {
          const productData = productDoc.data();
          console.log('✅ Product verified in Firestore:');
          console.log({
            name: productData.name,
            imageUrl: productData.imageUrl,
            price: productData.price,
            stock: productData.stock
          });
          
          if (productData.imageUrl && productData.imageUrl.includes('storage.googleapis.com')) {
            console.log('✅ Image URL looks correct and points to Firebase Storage!');
          } else {
            console.log('⚠️ Image URL might not be correct:', productData.imageUrl);
          }
        }
      } else {
        const errorText = await updateResponse.text();
        console.log('❌ Image upload failed');
        console.log('Error response:', errorText);
      }
      
    } else {
      console.log('❌ Simple product creation failed, cannot proceed with image test');
    }
    
  } catch (error) {
    console.error('Error in image upload test:', error);
  }
}

testImageUpload();
