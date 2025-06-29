// Test using node-fetch with proper FormData
import fetch from 'node-fetch';
import { FormData, File } from 'formdata-node';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testFormDataUpload() {
  try {
    console.log('=== Testing FormData Upload (Node.js) ===');
    
    // First create a simple product
    const simpleResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-admin-token-bypass',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Product for FormData',
        description: 'Will get an image via FormData',
        price: 8.99,
        category: 'Cakes',
        stock: 5,
        available: true,
        featured: false
      })
    });
    
    const simpleData = await simpleResponse.json();
    console.log('Product creation response:', simpleData);
    
    if (!simpleResponse.ok || !simpleData.success) {
      console.log('❌ Failed to create product');
      return;
    }
    
    const productId = simpleData.data.id;
    console.log('✅ Product created with ID:', productId);
    
    // Read the image file
    const imagePath = join(__dirname, '..', 'public', 'logo-large.png');
    const imageBuffer = fs.readFileSync(imagePath);
    console.log('📁 Read image file, size:', imageBuffer.length, 'bytes');
    
    // Create FormData using formdata-node (which is more browser-compatible)
    const formData = new FormData();
    formData.append('name', 'Test Product WITH FormData Image');
    formData.append('description', 'This image was uploaded via FormData');
    formData.append('price', '13.99');
    
    // Create a File object from the buffer
    const imageFile = new File([imageBuffer], 'test-image.png', {
      type: 'image/png'
    });
    formData.append('image', imageFile);
    
    console.log('📤 Sending FormData update...');
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const updateResponse = await fetch(`https://api-cvfhs7orea-uc.a.run.app/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer test-admin-token-bypass'
        // Don't set Content-Type - let FormData handle it
      },
      body: formData
    });
    
    console.log('📥 Update response status:', updateResponse.status);
    console.log('📥 Update response headers:');
    updateResponse.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    const responseText = await updateResponse.text();
    console.log('📥 Raw response:', responseText.substring(0, 500));
    
    if (updateResponse.ok) {
      try {
        const updateData = JSON.parse(responseText);
        console.log('✅ FormData update successful!');
        console.log('📋 Response data:', updateData);
        
        if (updateData.data && updateData.data.imageUrl) {
          console.log('🖼️ Image URL:', updateData.data.imageUrl);
          
          // Test image accessibility
          const imageTest = await fetch(updateData.data.imageUrl);
          console.log('🔗 Image accessibility test:', imageTest.status, imageTest.statusText);
          
          if (imageTest.ok) {
            console.log('✅ Image is accessible!');
            console.log('🎉 END-TO-END FORMDATA IMAGE UPLOAD TEST PASSED!');
          }
        } else {
          console.log('⚠️ No imageUrl in response');
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response:', parseError.message);
      }
    } else {
      console.log('❌ FormData update failed:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Error in FormData test:', error);
  }
}

testFormDataUpload();
