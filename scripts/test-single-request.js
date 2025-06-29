/**
 * Manual test of featured products endpoint with detailed output
 */

async function testFeaturedEndpoint() {
  console.log("Testing featured products endpoint...");
  
  const response = await fetch("https://api-cvfhs7orea-uc.a.run.app/api/products/featured?limit=5");
  const data = await response.json();
  
  console.log("Response:", JSON.stringify(data, null, 2));
}

testFeaturedEndpoint();
