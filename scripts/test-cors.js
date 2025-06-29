#!/usr/bin/env node

// Test CORS configuration for Firebase Functions
const fetch = require('node-fetch');

async function testCORS() {
  console.log('🌐 Testing CORS Configuration...');
  
  const apiUrl = 'https://api-cvfhs7orea-uc.a.run.app/api/admin/dashboard/stats';
  
  try {
    console.log(`📡 Testing API endpoint: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3001',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📋 Response Headers:`);
    
    // Check for CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': response.headers.get('access-control-allow-methods'),
      'Access-Control-Allow-Headers': response.headers.get('access-control-allow-headers'),
      'Access-Control-Allow-Credentials': response.headers.get('access-control-allow-credentials')
    };
    
    Object.entries(corsHeaders).forEach(([header, value]) => {
      if (value) {
        console.log(`   ✅ ${header}: ${value}`);
      } else {
        console.log(`   ❌ ${header}: Not present`);
      }
    });
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('\n🎉 CORS Headers Present - Frontend should now be able to make requests!');
    } else {
      console.log('\n❌ CORS Headers Missing - Frontend requests will still be blocked');
    }
    
  } catch (error) {
    console.error('❌ Error testing CORS:', error.message);
  }
}

// Alternative test for browser environment
function generateBrowserTest() {
  console.log('\n🌐 Browser Test Code:');
  console.log('Copy and paste this into your browser console to test CORS:');
  console.log(`
fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/dashboard/stats', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  }
})
.then(response => {
  console.log('CORS Test Success!', response.status);
  return response.json();
})
.then(data => console.log('Data:', data))
.catch(error => console.error('CORS Test Error:', error));
`);
}

// Run tests
testCORS()
  .then(() => {
    generateBrowserTest();
    console.log('\n✅ CORS test completed');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
