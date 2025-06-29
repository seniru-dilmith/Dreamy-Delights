const admin = require('firebase-admin');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'dreamy-delights-882ff.appspot.com'
});

async function testProductCreation() {
  try {
    console.log('Testing product creation with image upload...');
    
    // First, get an admin token using Firebase callable function
    console.log('Getting admin token via callable function...');
    const functions = admin.functions();
    const adminLoginFunction = functions.httpsCallable('adminLogin');
    
    const adminResult = await adminLoginFunction({
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Admin login response:', adminResult);
    
    if (!adminResult.data || !adminResult.data.success || !adminResult.data.data || !adminResult.data.data.token) {
      throw new Error('Failed to get admin token: ' + JSON.stringify(adminResult));
    }
    
    const token = adminResult.data.data.token;
    console.log('Got admin token');
    
    // Create form data for product creation
    const form = new FormData();
    form.append('name', 'Test Product ' + Date.now());
    form.append('description', 'A test product created via API');
    form.append('price', '99.99');
    form.append('category', 'cakes');
    form.append('available', 'true');
    form.append('featured', 'false');
    
    // Create a simple test image
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      // Create a simple 1x1 pixel JPEG for testing
      const testImageBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
        0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
        0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
        0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
        0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
        0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02,
        0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xAA, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, testImageBuffer);
    }
    
    form.append('image', fs.createReadStream(testImagePath), {
      filename: 'test-product.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('Creating product...');
    const response = await fetch('https://us-central1-dreamy-delights-882ff.cloudfunctions.net/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Product creation successful!');
      
      try {
        const parsedResult = JSON.parse(result);
        if (parsedResult.success && parsedResult.data && parsedResult.data.id) {
          console.log('Created product ID:', parsedResult.data.id);
          
          // Verify the product was created
          const db = admin.firestore();
          const productDoc = await db.collection('products').doc(parsedResult.data.id).get();
          if (productDoc.exists) {
            console.log('✅ Product verified in Firestore:', productDoc.data());
          } else {
            console.log('❌ Product not found in Firestore');
          }
        }
      } catch (parseError) {
        console.log('Could not parse response as JSON, but creation may have succeeded');
      }
    } else {
      console.log('❌ Product creation failed');
      console.log('Status:', response.status, response.statusText);
    }
    
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProductCreation();
