const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'dreamy-delights-882ff.appspot.com'
});

async function createBucket() {
  try {
    console.log('Attempting to create Firebase Storage bucket...');
    
    const storage = admin.storage();
    
    // Try to create bucket - though this might not work without proper permissions
    try {
      const [bucket] = await storage.createBucket('dreamy-delights-882ff.appspot.com', {
        location: 'US',
        storageClass: 'STANDARD',
      });
      console.log('✅ Bucket created:', bucket.name);
    } catch (createError) {
      console.log('❌ Could not create bucket:', createError.message);
      
      // Try different bucket formats
      const possibleBuckets = [
        'dreamy-delights-882ff.appspot.com',
        'gs://dreamy-delights-882ff.appspot.com',
        'dreamy-delights-882ff',
        'dreamy-delights-882ff.firebaseapp.com'
      ];
      
      console.log('Checking possible bucket names...');
      for (const bucketName of possibleBuckets) {
        try {
          const bucket = storage.bucket(bucketName);
          const [exists] = await bucket.exists();
          console.log(`Bucket ${bucketName}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
          
          if (exists) {
            console.log('✅ Found existing bucket:', bucketName);
            return;
          }
        } catch (error) {
          console.log(`Error checking bucket ${bucketName}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createBucket();
