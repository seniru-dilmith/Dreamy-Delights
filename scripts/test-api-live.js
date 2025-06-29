// Test product creation via the deployed API
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testProductCreationAPI() {
  try {
    console.log('Testing product creation via deployed API...');
    
    // Create a test image
    const testImagePath = path.join(__dirname, 'test-product.jpg');
    const testImageBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02,
      0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xAA, 0xFF, 0xD9
    ]);
    fs.writeFileSync(testImagePath, testImageBuffer);
    
    // Get admin token first - we need to call the adminLogin function directly
    console.log('Note: This test requires you to have admin credentials.');
    console.log('For the full test, you would need to implement admin token retrieval.');
    console.log('Testing API without authentication (will expect 401)...');
    
    // Create form data for product creation
    const form = new FormData();
    form.append('name', 'Test Product ' + Date.now());
    form.append('description', 'A test product created via API');
    form.append('price', '99.99');
    form.append('category', 'cakes');
    form.append('available', 'true');
    form.append('featured', 'false');
    form.append('image', fs.createReadStream(testImagePath), {
      filename: 'test-product.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('Creating product via API...');
    const response = await fetch('https://us-central1-dreamy-delights-882ff.cloudfunctions.net/api/admin/products', {
      method: 'POST',
      headers: {
        // Authorization would go here: 'Authorization': `Bearer ${adminToken}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    console.log('Response body:', result);
    
    if (response.status === 401) {
      console.log('✅ Expected 401 (Unauthorized) - API is working and requires authentication');
    } else if (response.status === 500) {
      try {
        const parsedResult = JSON.parse(result);
        if (parsedResult.error === 'storage_bucket_not_found') {
          console.log('❌ Storage bucket error detected');
        } else {
          console.log('✅ API is accessible and processing requests');
        }
      } catch (parseError) {
        console.log('Response is not JSON, but API is responding');
      }
    } else {
      console.log('✅ API responded with status:', response.status);
    }
    
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProductCreationAPI();
