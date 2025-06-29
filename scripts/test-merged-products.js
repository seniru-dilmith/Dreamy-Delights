/**
 * Test the merged products collection and new featured products API
 */

const baseURL = "https://api-cvfhs7orea-uc.a.run.app/api";

async function testMergedProductsAPI() {
  console.log("🧪 Testing merged products collection API...");
  
  try {
    // Test 1: Get all products
    console.log("\n1. Testing GET /products (all products):");
    const allProductsResponse = await fetch(`${baseURL}/products`);
    const allProducts = await allProductsResponse.json();
    console.log("All products status:", allProductsResponse.status);
    console.log("All products count:", allProducts.data?.length || 0);
    console.log("Sample products:", allProducts.data?.slice(0, 2).map(p => ({
      name: p.name,
      featured: p.featured,
      category: p.category
    })) || []);
    
    // Test 2: Get featured products only
    console.log("\n2. Testing GET /products/featured (featured only):");
    const featuredResponse = await fetch(`${baseURL}/products/featured?limit=20`);
    const featuredProducts = await featuredResponse.json();
    console.log("Featured products status:", featuredResponse.status);
    console.log("Featured products count:", featuredProducts.data?.length || 0);
    console.log("Featured products:", featuredProducts.data?.map(p => ({
      name: p.name,
      featured: p.featured,
      category: p.category
    })) || []);
    
    // Test 3: Verify old featured_products endpoint no longer exists
    console.log("\n3. Testing old /featured-products endpoint (should be 404):");
    try {
      const oldResponse = await fetch(`${baseURL}/featured-products`);
      console.log("Old endpoint status:", oldResponse.status);
      if (oldResponse.status === 404) {
        console.log("✅ Old endpoint correctly returns 404");
      } else {
        console.log("⚠️ Old endpoint still responding");
      }
    } catch (error) {
      console.log("✅ Old endpoint not found (as expected)");
    }
    
    // Test 4: Health check
    console.log("\n4. Testing API health:");
    const healthResponse = await fetch(`${baseURL}/health`);
    const health = await healthResponse.json();
    console.log("Health status:", healthResponse.status);
    console.log("Health message:", health.message);
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testMergedProductsAPI();
