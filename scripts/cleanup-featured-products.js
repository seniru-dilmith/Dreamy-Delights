/**
 * Clean up the old featured_products collection
 */

const { cleanupFeaturedProducts } = require('./migrate-featured-products');

async function runCleanup() {
  console.log("🧹 Starting cleanup of featured_products collection...");
  
  try {
    await cleanupFeaturedProducts();
    console.log("✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
}

runCleanup().then(() => process.exit(0));
