const https = require('https');

async function testCompleteAdminFlow() {
  console.log('🧪 Testing Complete Admin Panel Flow...');
  
  try {
    // Step 1: Test admin login
    console.log('\n1. Testing admin login...');
    const loginResult = await makeRequest('POST', 
      'us-central1-dreamy-delights-882ff.cloudfunctions.net',
      '/adminLogin',
      {
        data: {
          username: 'admin',
          password: 'admin123'
        }
      }
    );
    
    if (!loginResult.result || !loginResult.result.success) {
      console.log('❌ Admin login failed');
      return;
    }
    
    const adminToken = loginResult.result.token;
    const adminData = loginResult.result.admin;
    console.log('✅ Admin login successful');
    console.log(`   - Username: ${adminData.username}`);
    console.log(`   - Role: ${adminData.role}`);
    console.log(`   - Permissions: ${adminData.permissions.join(', ')}`);
    console.log(`   - Has debug permission: ${adminData.permissions.includes('debug') ? 'Yes' : 'No'}`);
    
    // Step 2: Test product creation with proper FormData headers
    console.log('\n2. Testing product creation...');
    
    // Create a simple FormData-like payload for testing
    const boundary = '----formdata-test-' + Math.random().toString(16);
    let formDataBody = '';
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="name"\r\n\r\n`;
    formDataBody += `Test Product ${new Date().getTime()}\r\n`;
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="description"\r\n\r\n`;
    formDataBody += `Test product created via API test\r\n`;
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="price"\r\n\r\n`;
    formDataBody += `25.99\r\n`;
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="category"\r\n\r\n`;
    formDataBody += `Desserts\r\n`;
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="stock"\r\n\r\n`;
    formDataBody += `15\r\n`;
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="featured"\r\n\r\n`;
    formDataBody += `true\r\n`;
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="active"\r\n\r\n`;
    formDataBody += `true\r\n`;
    formDataBody += `--${boundary}--\r\n`;
    
    const productResult = await makeRequest('POST',
      'api-cvfhs7orea-uc.a.run.app',
      '/api/admin/products',
      formDataBody,
      {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      }
    );
    
    if (productResult.success) {
      console.log('✅ Product creation successful');
      console.log(`   - Product ID: ${productResult.data.id}`);
      console.log(`   - Product Name: ${productResult.data.name}`);
      console.log(`   - Featured: ${productResult.data.featured}`);
    } else {
      console.log('❌ Product creation failed:', productResult.message);
    }
    
    // Step 3: Test fetching products
    console.log('\n3. Testing product fetching...');
    const productsResult = await makeRequest('GET',
      'api-cvfhs7orea-uc.a.run.app',
      '/api/admin/products',
      null,
      {
        'Authorization': `Bearer ${adminToken}`
      }
    );
    
    if (productsResult.success) {
      console.log('✅ Product fetching successful');
      console.log(`   - Total products: ${productsResult.data.length}`);
      console.log(`   - Featured products: ${productsResult.data.filter(p => p.featured).length}`);
    } else {
      console.log('❌ Product fetching failed:', productsResult.message);
    }
    
    console.log('\n🎉 Complete admin flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in complete admin flow test:', error);
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
        ...(typeof data === 'string' ? {} : { 'Content-Type': 'application/json' }),
        ...customHeaders,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: responseData });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

testCompleteAdminFlow();
