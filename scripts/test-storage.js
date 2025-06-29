// Test image upload using a simple approach
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert('./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json'),
    projectId: 'dreamy-delights-882ff',
    storageBucket: 'dreamy-delights-882ff.firebasestorage.app' // Use the same bucket as functions
  });
}

async function testStorageUpload() {
  try {
    console.log('=== Testing Firebase Storage Upload Directly ===');
    
    const storage = admin.storage();
    const bucket = storage.bucket();
    
    console.log('Bucket name:', bucket.name);
    
    // Check if bucket exists
    const [exists] = await bucket.exists();
    console.log('Bucket exists:', exists);
    
    if (!exists) {
      console.log('❌ Storage bucket does not exist');
      return;
    }
    
    // Test uploading a simple text file
    const testFileName = `products/test-${Date.now()}.txt`;
    const testContent = 'This is a test file for Firebase Storage';
    
    console.log('Uploading test file:', testFileName);
    
    const file = bucket.file(testFileName);
    await file.save(testContent, {
      metadata: {
        contentType: 'text/plain'
      }
    });
    
    console.log('✅ Test file uploaded successfully');
    
    // Make it public
    await file.makePublic();
    console.log('✅ Test file made public');
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${testFileName}`;
    console.log('Public URL:', publicUrl);
    
    // Test if we can access it
    const response = await fetch(publicUrl);
    const content = await response.text();
    console.log('Downloaded content:', content);
    
    if (content === testContent) {
      console.log('✅ Storage upload and download working correctly!');
    } else {
      console.log('❌ Storage content mismatch');
    }
    
    // Clean up
    await file.delete();
    console.log('✅ Test file deleted');
    
  } catch (error) {
    console.error('Error in storage test:', error);
  }
}

testStorageUpload();
