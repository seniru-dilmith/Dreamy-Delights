/**
 * Test product creation with image upload
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseURL = "https://api-cvfhs7orea-uc.a.run.app/api";

async function testProductCreation() {
  console.log("🧪 Testing product creation with image...");
  
  // You'll need to provide a valid admin token
  const adminToken = "YOUR_ADMIN_TOKEN_HERE"; // Replace with actual token
  
  if (adminToken === "YOUR_ADMIN_TOKEN_HERE") {
    console.log("❌ Please update the script with a valid admin token");
    console.log("You can get it from browser localStorage after logging in as admin");
    return;
  }
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('name', 'Test Product with Image');
    formData.append('description', 'A test product to verify image upload');
    formData.append('price', '19.99');
    formData.append('category', 'Test');
    formData.append('available', 'true');
    formData.append('featured', 'false');
    
    // Create a simple test image file (if you have one)
    // For now, let's try without an image first
    
    console.log("Sending product creation request...");
    
    const response = await fetch(`${baseURL}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log("Response body:", responseText);
    
    if (response.ok) {
      console.log("✅ Product created successfully!");
    } else {
      console.log("❌ Product creation failed");
    }
    
  } catch (error) {
    console.error("❌ Error testing product creation:", error);
  }
}

// Test without image first
async function testWithoutImage() {
  console.log("🧪 Testing product creation without image...");
  
  const adminToken = "YOUR_ADMIN_TOKEN_HERE"; // Replace with actual token
  
  if (adminToken === "YOUR_ADMIN_TOKEN_HERE") {
    console.log("❌ Please update the script with a valid admin token");
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('name', 'Test Product No Image');
    formData.append('description', 'A test product without image');
    formData.append('price', '15.99');
    formData.append('category', 'Test');
    formData.append('available', 'true');
    formData.append('featured', 'false');
    
    const response = await fetch(`${baseURL}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    const responseData = await response.json();
    console.log("Response:", responseData);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

console.log("To test product creation:");
console.log("1. Get admin token from browser localStorage");
console.log("2. Replace YOUR_ADMIN_TOKEN_HERE with actual token");
console.log("3. Run: node scripts/test-product-creation.js");

// testWithoutImage();
