#!/usr/bin/env node

/**
 * Test script to verify product update functionality works after normalization
 */

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app/api';

async function getAdminToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.token) {
      throw new Error('Login response missing token');
    }

    console.log('✅ Admin login successful');
    return data.token;
  } catch (error) {
    console.error('❌ Admin login failed:', error);
    throw error;
  }
}

async function testProductUpdate(token, productId) {
  try {
    console.log(`\n🧪 Testing product update for ID: ${productId}...`);
    
    const updateData = {
      name: 'Updated Test Product - ' + new Date().toISOString().substr(11, 8),
      description: 'Updated description via test script',
      price: 25.99,
      featured: true
    };

    console.log('📤 Sending update request...');
    console.log('📊 Update data:', updateData);

    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

async function main() {
  try {
    console.log('🚀 Starting product update test after normalization...');
    
    // Get admin token
    const token = await getAdminToken();
    
    // Test with the first few product IDs from our list
    const testProductIds = [
      '6camh6qrdsg1YmZwF2Jn', // Red Velvet Layer Cake
      'EKa4ibMuJOhdpMO8piuu', // Chocolate Dream Cupcake
      'pZrLc75IIh2BgPtdQO1r'  // Simple Test Product
    ];
    
    const results = [];
    
    for (const productId of testProductIds) {
      const result = await testProductUpdate(token, productId);
      results.push({ productId, result });
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    results.forEach(({ productId, result }) => {
      console.log(`${productId}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (!result.success) {
        console.log(`   Error: ${result.result?.message || result.error || 'Unknown error'}`);
      }
    });
    
    const successCount = results.filter(r => r.result.success).length;
    console.log(`\n🎯 ${successCount}/${results.length} tests passed`);
    
  } catch (error) {
    console.error('❌ Test script failed:', error);
  }
}

// Run the test
main().catch(console.error);
