#!/usr/bin/env node

/**
 * Database migration script to normalize product data structure
 * This script will ensure all products have consistent field names and types
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    storageBucket: 'dreamy-delights-882ff.firebasestorage.app'
  });
}

const db = admin.firestore();

async function normalizeProducts() {
  try {
    console.log('🔄 Starting product data normalization...');
    
    const productsSnapshot = await db.collection('products').get();
    
    if (productsSnapshot.empty) {
      console.log('❌ No products found in database');
      return;
    }

    console.log(`📦 Found ${productsSnapshot.size} products to normalize`);
    
    const batch = db.batch();
    let updateCount = 0;

    for (const doc of productsSnapshot.docs) {
      const data = doc.data();
      const updates = {};
      let needsUpdate = false;

      console.log(`\n🔍 Checking product: ${data.name || 'Unnamed'} (${doc.id})`);

      // Normalize image field (image -> imageUrl)
      if (data.image && !data.imageUrl) {
        updates.imageUrl = data.image;
        updates.image = admin.firestore.FieldValue.delete();
        needsUpdate = true;
        console.log('   📸 Migrating image -> imageUrl:', data.image);
      }

      // Ensure required fields exist with defaults
      if (data.stock === undefined || data.stock === null) {
        updates.stock = 0;
        needsUpdate = true;
        console.log('   📦 Adding missing stock field: 0');
      }

      if (data.active === undefined || data.active === null) {
        updates.active = true;
        needsUpdate = true;
        console.log('   ✅ Adding missing active field: true');
      }

      if (data.featured === undefined || data.featured === null) {
        updates.featured = false;
        needsUpdate = true;
        console.log('   ⭐ Adding missing featured field: false');
      }

      // Ensure imageUrl has a default
      if (!data.imageUrl && !data.image) {
        updates.imageUrl = '/placeholder.jpg';
        needsUpdate = true;
        console.log('   🖼️ Adding default imageUrl: /placeholder.jpg');
      }

      // Ensure category is properly formatted
      if (data.category && typeof data.category === 'string') {
        const normalizedCategory = data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase();
        if (normalizedCategory !== data.category) {
          updates.category = normalizedCategory;
          needsUpdate = true;
          console.log(`   🏷️ Normalizing category: ${data.category} -> ${normalizedCategory}`);
        }
      } else if (!data.category) {
        updates.category = 'Desserts';
        needsUpdate = true;
        console.log('   🏷️ Adding missing category: Desserts');
      }

      // Remove embedded id field if it exists (doc ID is the source of truth)
      if (data.id) {
        updates.id = admin.firestore.FieldValue.delete();
        needsUpdate = true;
        console.log('   🗑️ Removing embedded id field');
      }

      // Ensure proper data types
      if (data.price !== undefined && typeof data.price !== 'number') {
        const numPrice = parseFloat(data.price);
        if (!isNaN(numPrice)) {
          updates.price = numPrice;
          needsUpdate = true;
          console.log(`   💰 Converting price to number: ${data.price} -> ${numPrice}`);
        }
      }

      if (data.stock !== undefined && typeof data.stock !== 'number') {
        const numStock = parseInt(data.stock);
        if (!isNaN(numStock)) {
          updates.stock = numStock;
          needsUpdate = true;
          console.log(`   📦 Converting stock to number: ${data.stock} -> ${numStock}`);
        }
      }

      // Add updatedAt if missing
      if (!data.updatedAt) {
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
        console.log('   🕒 Adding missing updatedAt timestamp');
      }

      if (needsUpdate) {
        batch.update(doc.ref, updates);
        updateCount++;
        console.log(`   ✅ Scheduled updates for ${data.name || 'Unnamed'}`);
      } else {
        console.log(`   ✓ No updates needed for ${data.name || 'Unnamed'}`);
      }
    }

    if (updateCount > 0) {
      console.log(`\n🚀 Committing ${updateCount} product updates...`);
      await batch.commit();
      console.log('✅ All product updates committed successfully!');
    } else {
      console.log('\n✓ No updates needed - all products are already normalized');
    }

    // Verify the results
    console.log('\n🔍 Verification: Fetching updated products...');
    const verificationSnapshot = await db.collection('products').get();
    
    console.log('\n📊 FINAL STRUCTURE SUMMARY:');
    verificationSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.name || 'Unnamed'} (${doc.id}):`);
      console.log(`   - imageUrl: ${data.imageUrl || 'MISSING'}`);
      console.log(`   - stock: ${data.stock} (${typeof data.stock})`);
      console.log(`   - active: ${data.active} (${typeof data.active})`);
      console.log(`   - featured: ${data.featured} (${typeof data.featured})`);
      console.log(`   - category: ${data.category || 'MISSING'}`);
      console.log(`   - price: ${data.price} (${typeof data.price})`);
      console.log(`   - has embedded id: ${!!data.id}`);
    });

  } catch (error) {
    console.error('❌ Error normalizing products:', error);
    throw error;
  }
}

async function main() {
  try {
    await normalizeProducts();
    console.log('\n🎉 Product normalization completed successfully!');
  } catch (error) {
    console.error('❌ Product normalization failed:', error);
    process.exit(1);
  }
}

// Run the migration
main().catch(console.error);
