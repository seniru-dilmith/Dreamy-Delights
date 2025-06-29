const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');

// Try different bucket configurations
const bucketConfigs = [
  'dreamy-delights-882ff.firebasestorage.app',  // New Firebase Storage format
  'dreamy-delights-882ff.appspot.com',  // Standard format
  'dreamy-delights-882ff.firebaseapp.com', // Alternative format
  null  // Let Firebase determine default bucket
];

async function testImageUpload() {
  for (let i = 0; i < bucketConfigs.length; i++) {
    const bucketName = bucketConfigs[i];
    console.log(`\n=== Testing with bucket: ${bucketName || 'default'} ===`);
    
    try {
      // Initialize Firebase Admin
      if (admin.apps.length) {
        admin.app().delete();
      }
      
      const config = {
        credential: admin.credential.cert(serviceAccount),
      };
      
      if (bucketName) {
        config.storageBucket = bucketName;
      }
      
      admin.initializeApp(config);
      
      console.log('Testing Firebase Storage image upload...');
      
      const storage = admin.storage();
      const bucket = storage.bucket();
      
      console.log('Bucket name:', bucket.name);
      
      // Check if bucket exists first
      console.log('Checking if bucket exists...');
      const [exists] = await bucket.exists();
      console.log('Bucket exists:', exists);
      
      if (!exists) {
        console.log('❌ Bucket does not exist, trying next configuration...');
        continue;
      }      
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
        console.log('Created test image at:', testImagePath);
      }
      
      // Test uploading the image
      const fileName = `products/test-${Date.now()}.jpg`;
      const file = bucket.file(fileName);
      
      console.log('Uploading image to:', fileName);
      
      const imageBuffer = fs.readFileSync(testImagePath);
      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/jpeg',
        },
      });
      
      console.log('✅ Image uploaded successfully');
      
      // Make file publicly readable
      await file.makePublic();
      console.log('✅ Image made public');
      
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      console.log('✅ Image URL:', imageUrl);
      
      // Test creating a product in Firestore with the image
      const db = admin.firestore();
      const productData = {
        name: 'Test Product with Image ' + Date.now(),
        description: 'A test product created via script',
        price: 99.99,
        category: 'cakes',
        available: true,
        featured: false,
        imageUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'test-script',
      };
      
      console.log('Creating product in Firestore...');
      const docRef = await db.collection('products').add(productData);
      console.log('✅ Product created with ID:', docRef.id);
      
      // Verify the product exists
      const productDoc = await docRef.get();
      if (productDoc.exists) {
        console.log('✅ Product verified:', productDoc.data());
      }
      
      // Clean up test image
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
      
      // Clean up uploaded image
      console.log('Cleaning up uploaded image...');
      await file.delete();
      console.log('✅ Uploaded image deleted');
      
      // Clean up Firestore document
      console.log('Cleaning up Firestore document...');
      await docRef.delete();
      console.log('✅ Product document deleted');
      
      console.log('✅ All tests passed! Image upload and product creation work correctly.');
      return; // Success, exit function
      
    } catch (error) {
      console.error('❌ Test failed for this bucket configuration:', error.message);
      
      if (i === bucketConfigs.length - 1) {
        console.error('❌ All bucket configurations failed. Final error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      }
    }
  }
}

testImageUpload();
