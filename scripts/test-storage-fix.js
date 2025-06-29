/**
 * Simple test for product creation after fixing storage rules
 */

async function testProductCreationFixed() {
  console.log("🧪 Testing product creation after storage rules fix...");
  
  const baseURL = "https://api-cvfhs7orea-uc.a.run.app/api";
  
  // Test creating a product without authentication (should fail with 401)
  try {
    const formData = new FormData();
    formData.append('name', 'Test Product');
    formData.append('description', 'Test description');
    formData.append('price', '10.99');
    formData.append('category', 'Test');
    
    const response = await fetch(`${baseURL}/admin/products`, {
      method: 'POST',
      body: formData
    });
    
    console.log("Response status:", response.status);
    const responseData = await response.json();
    console.log("Response data:", responseData);
    
    if (response.status === 401) {
      console.log("✅ Authentication working correctly (401 as expected)");
    } else {
      console.log("⚠️ Unexpected response");
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testProductCreationFixed();
