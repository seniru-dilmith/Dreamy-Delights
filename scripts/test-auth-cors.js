/**
 * Test authenticated admin API request with CORS
 */

const baseURL = "https://api-cvfhs7orea-uc.a.run.app/api";

async function testAuthenticatedRequest() {
  console.log("Testing authenticated admin request with CORS...");
  
  // Get admin token from local storage (or you can provide it here)
  const adminToken = "YOUR_ADMIN_TOKEN_HERE"; // Replace with actual token
  
  if (adminToken === "YOUR_ADMIN_TOKEN_HERE") {
    console.log("Please update the script with your actual admin token");
    console.log("You can get it from browser localStorage or by logging in again");
    return;
  }
  
  try {
    // Test authenticated GET request
    console.log("\n1. Testing authenticated GET /admin/products:");
    const getResponse = await fetch(`${baseURL}/admin/products`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("GET Response Status:", getResponse.status);
    console.log("GET CORS Headers:");
    for (const [key, value] of getResponse.headers.entries()) {
      if (key.includes('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log("Products count:", data.data?.length || 0);
      
      if (data.data && data.data.length > 0) {
        const productId = data.data[0].id;
        console.log(`\n2. Testing PUT request for product ${productId}:`);
        
        // Test PUT request to update product
        const putResponse = await fetch(`${baseURL}/admin/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Origin': 'http://localhost:3000',
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: data.data[0].name + " (CORS Test)",
            description: data.data[0].description,
            price: data.data[0].price,
            category: data.data[0].category,
            imageUrl: data.data[0].imageUrl,
            featured: data.data[0].featured
          })
        });
        
        console.log("PUT Response Status:", putResponse.status);
        console.log("PUT CORS Headers:");
        for (const [key, value] of putResponse.headers.entries()) {
          if (key.includes('access-control')) {
            console.log(`  ${key}: ${value}`);
          }
        }
        
        if (putResponse.ok) {
          const updateData = await putResponse.json();
          console.log("Update successful:", updateData.success);
        } else {
          const errorText = await putResponse.text();
          console.log("Update error:", errorText);
        }
      }
    } else {
      const errorText = await getResponse.text();
      console.log("Auth error:", errorText);
    }
    
  } catch (error) {
    console.error("Error testing authenticated request:", error);
  }
}

testAuthenticatedRequest();
