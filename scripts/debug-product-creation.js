const https = require('https');

async function debugProductCreation() {
  console.log('🔍 Debugging Product Creation...');
  
  try {
    // Step 1: Get admin token
    console.log('\n1. Getting admin token...');
    const loginResponse = await makeRequest('POST', 
      'us-central1-dreamy-delights-882ff.cloudfunctions.net',
      '/adminLogin',
      {
        data: {
          username: 'admin',
          password: 'admin123'
        }
      }
    );
    
    const adminToken = loginResponse.result.token;
    console.log('✅ Got admin token');
    
    // Step 2: Test simple JSON product creation first
    console.log('\n2. Testing simple JSON product creation...');
    const simpleProduct = {
      name: 'Simple Test Product',
      description: 'Test product with JSON',
      price: 15.99,
      category: 'Desserts',
      stock: 10,
      featured: false,
      active: true
    };
    
    const jsonResult = await makeRequest('POST',
      'api-cvfhs7orea-uc.a.run.app',
      '/api/admin/products',
      simpleProduct,
      {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    );
    
    console.log('JSON Product Creation Result:', JSON.stringify(jsonResult, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function makeRequest(method, hostname, path, data, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const postData = typeof data === 'string' ? data : JSON.stringify(data);
    
    const options = {
      hostname,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log('Making request to:', `https://${hostname}${path}`);
    console.log('Headers:', options.headers);
    console.log('Body:', postData.substring(0, 200) + (postData.length > 200 ? '...' : ''));
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Raw response:', responseData);
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: responseData, parseError: e.message });
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

debugProductCreation();
