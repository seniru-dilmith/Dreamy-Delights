/**
 * Debug the featured products filtering
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

async function debugFeaturedProducts() {
  console.log("🔍 Debugging featured products filtering...");
  
  try {
    // Get all products to see what we have
    console.log("\n1. All products in database:");
    const allSnapshot = await db.collection("products").get();
    console.log(`Total products: ${allSnapshot.size}`);
    
    allSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.name}: featured=${data.featured} (${typeof data.featured})`);
    });
    
    // Test featured=true filter
    console.log("\n2. Products with featured=true:");
    const featuredSnapshot = await db.collection("products")
      .where("featured", "==", true)
      .get();
    
    console.log(`Featured products found: ${featuredSnapshot.size}`);
    featuredSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.name}: featured=${data.featured}`);
    });
    
    // Test featured=false filter
    console.log("\n3. Products with featured=false:");
    const notFeaturedSnapshot = await db.collection("products")
      .where("featured", "==", false)
      .get();
    
    console.log(`Not featured products found: ${notFeaturedSnapshot.size}`);
    notFeaturedSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.name}: featured=${data.featured}`);
    });
    
    // Test products without featured field
    console.log("\n4. Products without featured field:");
    const noFeaturedSnapshot = await db.collection("products")
      .where("featured", "==", null)
      .get();
    
    console.log(`Products without featured field: ${noFeaturedSnapshot.size}`);
    
  } catch (error) {
    console.error("Error debugging:", error);
  }
}

debugFeaturedProducts().then(() => process.exit(0));
