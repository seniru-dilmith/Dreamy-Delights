/**
 * Test dashboard API directly
 */

// Load .env variables
require('dotenv').config();

const https = require('https');

// Base URL for HTTP API (from environment)
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

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API...\n');
  
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
    
    // Step 2: Test dashboard stats API
    console.log('\n2. Testing dashboard stats API...');
    const statsResponse = await makeRequest('/admin/dashboard/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log(`Stats Status: ${statsResponse.status}`);
    console.log('Stats Response:', JSON.stringify(statsResponse.data, null, 2));
    
    if (statsResponse.status === 200 && statsResponse.data.success) {
      console.log('✅ Dashboard stats API working correctly');
      console.log('📊 Actual stats data:');
      console.log(`   - Products: ${statsResponse.data.data.totalProducts}`);
      console.log(`   - Orders: ${statsResponse.data.data.totalOrders}`);
      console.log(`   - Users: ${statsResponse.data.data.totalUsers}`);
      console.log(`   - Revenue: $${statsResponse.data.data.totalRevenue}`);
    } else {
      console.log('❌ Dashboard stats API failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDashboardAPI();
