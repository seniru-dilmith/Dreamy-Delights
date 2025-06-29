/**
 * Test CORS headers for deployed API
 */

const baseURL = "https://api-cvfhs7orea-uc.a.run.app/api";

async function testCORS() {
  console.log("Testing CORS headers...");
  
  try {
    // Test OPTIONS request (preflight)
    console.log("\n1. Testing OPTIONS preflight request:");
    const optionsResponse = await fetch(`${baseURL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log("Options Response Status:", optionsResponse.status);
    console.log("Options Response Headers:");
    for (const [key, value] of optionsResponse.headers.entries()) {
      if (key.includes('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    // Test GET request
    console.log("\n2. Testing GET request:");
    const getResponse = await fetch(`${baseURL}/health`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
      }
    });
    
    console.log("GET Response Status:", getResponse.status);
    console.log("GET Response Headers:");
    for (const [key, value] of getResponse.headers.entries()) {
      if (key.includes('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const data = await getResponse.json();
    console.log("GET Response Data:", data);
    
    // Test PUT request to admin endpoint (without auth - should fail with 401, but CORS should work)
    console.log("\n3. Testing PUT request (should show CORS headers even on 401):");
    const putResponse = await fetch(`${baseURL}/admin/products/test-id`, {
      method: 'PUT',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Test Product' })
    });
    
    console.log("PUT Response Status:", putResponse.status);
    console.log("PUT Response Headers:");
    for (const [key, value] of putResponse.headers.entries()) {
      if (key.includes('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    }
    
  } catch (error) {
    console.error("Error testing CORS:", error);
  }
}

testCORS();
