const https = require('https');

async function testAdminLoginAPI() {
  console.log('🔍 Testing admin login via Firebase Functions API...');
  
  const postData = JSON.stringify({
    data: {
      username: 'admin',
      password: 'admin123'
    }
  });
  
  const options = {
    hostname: 'us-central1-dreamy-delights-882ff.cloudfunctions.net',
    path: '/adminLogin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', data);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testProductCreationAPI() {
  console.log('\n🔍 Testing product creation via Firebase Functions API...');
  
  // First login to get a token
  try {
    const loginResult = await testAdminLoginAPI();
    const loginData = JSON.parse(loginResult.data);
    
    if (!loginData.result || !loginData.result.success) {
      console.log('❌ Admin login failed, cannot test product creation');
      return;
    }
    
    const adminToken = loginData.result.token;
    console.log('✅ Got admin token:', adminToken ? 'Token received' : 'No token');
    
    // Now test product creation
    const productData = JSON.stringify({
      name: 'Test Product',
      description: 'A test product for API testing',
      price: 29.99,
      category: 'desserts',
      featured: true,
      image: 'https://example.com/test-image.jpg'
    });
    
    const options = {
      hostname: 'api-cvfhs7orea-uc.a.run.app',
      path: '/api/admin/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'Content-Length': Buffer.byteLength(productData)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`Product creation status: ${res.statusCode}`);
          console.log('Product creation response:', data);
          resolve({ status: res.statusCode, data });
        });
      });
      
      req.on('error', (err) => {
        console.error('Product creation request error:', err);
        reject(err);
      });
      
      req.write(productData);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Error in product creation test:', error);
  }
}

async function runTests() {
  try {
    await testAdminLoginAPI();
    await testProductCreationAPI();
    console.log('\n✅ API tests completed');
  } catch (error) {
    console.error('❌ API tests failed:', error);
  }
}

runTests();
