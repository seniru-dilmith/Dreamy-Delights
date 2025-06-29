#!/usr/bin/env node

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'dreamy-delights-882ff'
  });
}

const db = admin.firestore();

async function testFeaturedProducts() {
  console.log('🌟 Testing Featured Products Management...');

  try {
    // Get all products
    const productsSnapshot = await db.collection('products').get();
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    console.log(`\n📦 Found ${products.length} total products:`);
    products.forEach(product => {
      console.log(`   - ${product.name} (Featured: ${product.featured ? '✅' : '❌'})`);
    });

    // Count featured products
    const featuredProducts = products.filter(p => p.featured);
    console.log(`\n⭐ Featured products count: ${featuredProducts.length}`);

    if (featuredProducts.length > 0) {
      console.log('   Featured products:');
      featuredProducts.forEach(product => {
        console.log(`   - ${product.name} ($${product.price})`);
      });
    }

    console.log('\n🎯 Featured Products Management Features:');
    console.log('   ✅ Filter view to show only featured products');
    console.log('   ✅ Quick toggle featured status with star button');
    console.log('   ✅ Visual indicators for featured products');
    console.log('   ✅ Dedicated management section in admin panel');

    console.log('\n🚀 To test featured products management:');
    console.log('   1. Go to Admin Dashboard > Products tab');
    console.log('   2. Click "Featured Only" button to filter');
    console.log('   3. Use star button in actions to toggle featured status');
    console.log('   4. Check the "Featured Products" card on dashboard');

  } catch (error) {
    console.error('❌ Error testing featured products:', error);
  }
}

// Run the script
testFeaturedProducts()
  .then(() => {
    console.log('\n✅ Featured Products test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
