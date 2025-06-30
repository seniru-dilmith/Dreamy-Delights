/**
 * Test admin products API directly
 */

const https = require('https');
require('dotenv').config();

const API_BASE_URL = process.env.NEXT_FUNCTIONS_URL + '/api';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${path}`;
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testAdminProductsAPI() {
  console.log('🧪 Testing Admin Products API...\n');
  
  try {
    // Step 1: Login to get JWT token
    console.log('1. Logging in to get JWT token...');
    const loginResponse = await makeRequest('/admin/login', {
      method: 'POST',
      body: {
        username: 'admin',
        password: 'admin123'
      }
    });
    
    console.log(`Login Status: ${loginResponse.status}`);
    
    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const adminToken = loginResponse.data.token;
    console.log('✅ Login successful, got JWT token');
    
    // Step 2: Test admin products API
    console.log('\n2. Testing admin products API...');
    const productsResponse = await makeRequest('/admin/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log(`Products Status: ${productsResponse.status}`);
    console.log('Products Response:', JSON.stringify(productsResponse.data, null, 2));
    
    if (productsResponse.status === 200 && productsResponse.data.success) {
      console.log('✅ Admin products API working correctly');
      console.log('📦 Products data:');
      console.log(`   - Total products: ${productsResponse.data.data.length}`);
      
      if (productsResponse.data.data.length > 0) {
        productsResponse.data.data.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.category})`);
        });
      } else {
        console.log('   - No products found in database');
      }
    } else {
      console.log('❌ Admin products API failed');
      console.log('Error details:', productsResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminProductsAPI();
