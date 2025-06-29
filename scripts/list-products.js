#!/usr/bin/env node

/**
 * Script to check existing products in the database
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

async function listProducts() {
  try {
    console.log('🔍 Checking existing products in database...');
    
    const productsSnapshot = await db.collection('products').get();
    
    if (productsSnapshot.empty) {
      console.log('❌ No products found in database');
      return [];
    }

    console.log(`✅ Found ${productsSnapshot.size} products:`);
    console.log(''); // Empty line for readability

    const products = [];
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      const product = {
        id: doc.id,
        name: data.name || 'Unnamed',
        category: data.category || 'No category',
        price: data.price || 0,
        featured: data.featured || false,
        active: data.active !== false, // Default to true if not specified
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : 'Unknown',
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : 'Unknown'
      };
      
      products.push(product);
      
      console.log(`📦 Product: ${product.name}`);
      console.log(`   🆔 ID: ${product.id}`);
      console.log(`   🏷️ Category: ${product.category}`);
      console.log(`   💰 Price: $${product.price}`);
      console.log(`   ⭐ Featured: ${product.featured ? 'Yes' : 'No'}`);
      console.log(`   ✅ Active: ${product.active ? 'Yes' : 'No'}`);
      console.log(`   📅 Created: ${product.createdAt}`);
      console.log(`   🔄 Updated: ${product.updatedAt}`);
      console.log('   ───────────────────────────────────');
    });

    return products;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
}

async function main() {
  try {
    const products = await listProducts();
    
    console.log(''); // Empty line
    console.log('📊 SUMMARY:');
    console.log(`   Total products: ${products.length}`);
    console.log(`   Featured products: ${products.filter(p => p.featured).length}`);
    console.log(`   Active products: ${products.filter(p => p.active).length}`);
    console.log(`   Categories: ${[...new Set(products.map(p => p.category))].join(', ')}`);
    
    if (products.length > 0) {
      console.log(''); // Empty line
      console.log('🔍 Product IDs for testing:');
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}: ${product.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
main().catch(console.error);
