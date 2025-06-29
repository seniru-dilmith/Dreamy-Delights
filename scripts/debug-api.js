/**
 * Test the API endpoints directly with detailed debugging
 */

const baseURL = "https://api-cvfhs7orea-uc.a.run.app/api";

async function testAPIEndpoints() {
  console.log("🔍 Testing API endpoints with debugging...");
  
  try {
    // Test the featured products endpoint
    console.log("\n1. Testing /products/featured endpoint:");
    const response = await fetch(`${baseURL}/products/featured?limit=20`);
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log("Response data structure:", {
      success: data.success,
      dataLength: data.data?.length,
      pagination: data.pagination
    });
    
    console.log("Individual products:");
    data.data?.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name}: featured=${product.featured}`);
    });
    
    // Test the all products endpoint
    console.log("\n2. Testing /products endpoint (all):");
    const allResponse = await fetch(`${baseURL}/products?limit=20`);
    const allData = await allResponse.json();
    
    console.log("All products count:", allData.data?.length);
    const featuredCount = allData.data?.filter(p => p.featured === true).length;
    const notFeaturedCount = allData.data?.filter(p => p.featured === false).length;
    
    console.log(`Featured: ${featuredCount}, Not featured: ${notFeaturedCount}`);
    
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testAPIEndpoints();
