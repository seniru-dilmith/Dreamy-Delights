/**
 * Migration Script: Merge featured_products into products collection
 * 
 * This script will:
 * 1. Check current data in both collections
 * 2. Merge featured_products into products with featured:true
 * 3. Remove duplicates and update existing products
 * 4. Clean up the featured_products collection
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "dreamy-delights-882ff.appspot.com"
  });
}

const db = admin.firestore();

async function analyzeCollections() {
  console.log("🔍 Analyzing current collections...");
  
  // Get products
  const productsSnapshot = await db.collection("products").get();
  console.log(`\n📦 Products collection: ${productsSnapshot.size} documents`);
  
  const products = [];
  productsSnapshot.forEach(doc => {
    const data = doc.data();
    products.push({
      id: doc.id,
      name: data.name,
      featured: data.featured || false,
      ...data
    });
  });
  
  // Get featured products
  const featuredSnapshot = await db.collection("featured_products").get();
  console.log(`⭐ Featured_products collection: ${featuredSnapshot.size} documents`);
  
  const featuredProducts = [];
  featuredSnapshot.forEach(doc => {
    const data = doc.data();
    featuredProducts.push({
      id: doc.id,
      name: data.name,
      ...data
    });
  });
  
  console.log("\n📊 Analysis:");
  console.log("Products:", products.map(p => `${p.name} (featured: ${p.featured})`));
  console.log("Featured Products:", featuredProducts.map(p => p.name));
  
  return { products, featuredProducts };
}

async function mergeCollections() {
  console.log("\n🔄 Starting migration...");
  
  const { products, featuredProducts } = await analyzeCollections();
  
  // Create a map of existing products by name for deduplication
  const productsByName = new Map();
  products.forEach(product => {
    productsByName.set(product.name.toLowerCase(), product);
  });
  
  const batch = db.batch();
  let updateCount = 0;
  let addCount = 0;
  
  // Process featured products
  for (const featuredProduct of featuredProducts) {
    const existingProduct = productsByName.get(featuredProduct.name.toLowerCase());
    
    if (existingProduct) {
      // Update existing product to mark as featured
      console.log(`📝 Updating existing product "${existingProduct.name}" to featured`);
      const productRef = db.collection("products").doc(existingProduct.id);
      batch.update(productRef, { 
        featured: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updateCount++;
    } else {
      // Add new product from featured_products with featured=true
      console.log(`➕ Adding new featured product "${featuredProduct.name}"`);
      const newProductRef = db.collection("products").doc();
      batch.set(newProductRef, {
        ...featuredProduct,
        featured: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      addCount++;
    }
  }
  
  // Commit the batch
  if (updateCount > 0 || addCount > 0) {
    await batch.commit();
    console.log(`✅ Migration completed: ${updateCount} updated, ${addCount} added`);
  } else {
    console.log("ℹ️ No changes needed");
  }
  
  return { updateCount, addCount };
}

async function cleanupFeaturedProducts() {
  console.log("\n🧹 Cleaning up featured_products collection...");
  
  const snapshot = await db.collection("featured_products").get();
  
  if (snapshot.empty) {
    console.log("ℹ️ Featured_products collection is already empty");
    return;
  }
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`✅ Deleted ${snapshot.size} documents from featured_products collection`);
}

async function verifyMigration() {
  console.log("\n✔️ Verifying migration...");
  
  const productsSnapshot = await db.collection("products").get();
  const featuredCount = productsSnapshot.docs.filter(doc => doc.data().featured === true).length;
  
  console.log(`📦 Total products: ${productsSnapshot.size}`);
  console.log(`⭐ Featured products: ${featuredCount}`);
  
  // List featured products
  console.log("\n⭐ Featured products:");
  productsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.featured) {
      console.log(`  - ${data.name} (${data.category || 'No category'})`);
    }
  });
}

async function runMigration() {
  try {
    console.log("🚀 Starting Products Collection Migration");
    console.log("=====================================");
    
    // Step 1: Analyze current state
    await analyzeCollections();
    
    // Step 2: Merge collections
    const result = await mergeCollections();
    
    // Step 3: Verify migration
    await verifyMigration();
    
    // Step 4: Cleanup (optional - commented out for safety)
    console.log("\n⚠️ Featured_products cleanup is available but not run automatically.");
    console.log("Run cleanupFeaturedProducts() separately if you want to remove the old collection.");
    
    console.log("\n🎉 Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

// Export functions for manual use
module.exports = {
  analyzeCollections,
  mergeCollections,
  cleanupFeaturedProducts,
  verifyMigration,
  runMigration
};

// Run migration if called directly
if (require.main === module) {
  runMigration().then(() => process.exit(0));
}
