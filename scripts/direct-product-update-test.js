#!/usr/bin/env node

/**
 * Simple debug script for testing product update functionality
 * Bypasses login by using the existing admin UI token from localStorage
 */

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app/api';

// You need to replace this with a valid token from the admin UI
// Go to the admin panel, open browser dev tools, and get the token from localStorage
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'REPLACE_WITH_VALID_TOKEN';

async function testProductUpdateDirect() {
  try {
    console.log('\n🧪 Testing product update directly...');
    
    const testProductId = 'BUVjWO59u63QeOc80XGg'; // Use existing product ID
    
    const updateData = {
      name: 'Updated Test Product via HTTP',
      description: 'Updated description via direct HTTP test',
      price: 29.99,
      featured: true
    };

    console.log('📤 Sending update request...');
    console.log('🆔 Product ID:', testProductId);
    console.log('📊 Update data:', updateData);
    console.log('🔐 Token:', ADMIN_TOKEN ? 'Present' : 'Missing');

    const response = await fetch(`${API_BASE_URL}/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📨 Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      result = { success: false, message: 'Invalid JSON response', rawResponse: responseText };
    }

    if (response.ok && result.success) {
      console.log('✅ Update successful');
      return { success: true, result };
    } else {
      console.error('❌ Update failed:', result);
      return { success: false, result };
    }
  } catch (error) {
    console.error('❌ Update request failed:', error);
    return { success: false, error: error.message };
  }
}

async function testProductUpdateFormData() {
  try {
    console.log('\n🧪 Testing product update with FormData (no image)...');
    
    const testProductId = 'BUVjWO59u63QeOc80XGg'; // Use existing product ID
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('name', 'Updated via FormData Test');
    formData.append('description', 'Updated via FormData description');
    formData.append('price', '35.99');
    formData.append('featured', 'false');

    console.log('📤 Sending FormData update request...');
    console.log('🆔 Product ID:', testProductId);
    console.log('🔐 Token:', ADMIN_TOKEN ? 'Present' : 'Missing');

    const response = await fetch(`${API_BASE_URL}/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📨 Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      result = { success: false, message: 'Invalid JSON response', rawResponse: responseText };
    }

    if (response.ok && result.success) {
      console.log('✅ FormData update successful');
      return { success: true, result };
    } else {
      console.error('❌ FormData update failed:', result);
      return { success: false, result };
    }
  } catch (error) {
    console.error('❌ FormData update request failed:', error);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Starting direct product update test...');
    
    if (ADMIN_TOKEN === 'REPLACE_WITH_VALID_TOKEN') {
      console.log('⚠️  Please set ADMIN_TOKEN environment variable or replace the token in the script');
      console.log('   You can get the token from the admin UI localStorage: adminToken');
      return;
    }
    
    // Test JSON update
    const jsonResult = await testProductUpdateDirect();
    
    // Test FormData update
    const formDataResult = await testProductUpdateFormData();
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('JSON Update:', jsonResult.success ? '✅ SUCCESS' : '❌ FAILED');
    console.log('FormData Update:', formDataResult.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (!jsonResult.success) {
      console.log('JSON Error:', jsonResult.result || jsonResult.error);
    }
    if (!formDataResult.success) {
      console.log('FormData Error:', formDataResult.result || formDataResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test script failed:', error);
  }
}

// Run the test
main().catch(console.error);
