const https = require('https');

async function testProductCreationModes() {
  console.log('🧪 Testing Product Creation - JSON vs FormData...');
  
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
    
    // Step 2: Test JSON product creation (no image)
    console.log('\n2. Testing JSON product creation (no image)...');
    const jsonProduct = {
      name: 'JSON Test Product',
      description: 'Test product created with JSON',
      price: 19.99,
      category: 'Desserts',
      stock: 8,
      featured: false,
      active: true
    };
    
    const jsonResult = await makeRequest('POST',
      'api-cvfhs7orea-uc.a.run.app',
      '/api/admin/products',
      jsonProduct,
      {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    );
    
    console.log('JSON Product Creation Result:', jsonResult.success ? '✅ Success' : '❌ Failed');
    if (!jsonResult.success) {
      console.log('Error:', jsonResult.message);
    } else {
      console.log('Created product:', jsonResult.data.name, 'with ID:', jsonResult.data.id);
    }
    
    // Step 3: Test FormData product creation (simulated with image)
    console.log('\n3. Testing FormData product creation (with simulated image)...');
    
    // Create proper FormData boundary
    const boundary = '----formdata-' + Math.random().toString(16);
    let formDataBody = '';
    
    // Add regular fields
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="name"\r\n\r\n`;
    formDataBody += `FormData Test Product\r\n`;
    
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="description"\r\n\r\n`;
    formDataBody += `Test product created with FormData\r\n`;
    
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="price"\r\n\r\n`;
    formDataBody += `29.99\r\n`;
    
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="category"\r\n\r\n`;
    formDataBody += `Cakes\r\n`;
    
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="stock"\r\n\r\n`;
    formDataBody += `12\r\n`;
    
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="featured"\r\n\r\n`;
    formDataBody += `true\r\n`;
    
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="active"\r\n\r\n`;
    formDataBody += `true\r\n`;
    
    // Add a fake image file
    formDataBody += `--${boundary}\r\n`;
    formDataBody += `Content-Disposition: form-data; name="image"; filename="test.png"\r\n`;
    formDataBody += `Content-Type: image/png\r\n\r\n`;
    formDataBody += `fake-image-data\r\n`;
    
    formDataBody += `--${boundary}--\r\n`;
    
    const formDataResult = await makeRequest('POST',
      'api-cvfhs7orea-uc.a.run.app',
      '/api/admin/products',
      formDataBody,
      {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      }
    );
    
    console.log('FormData Product Creation Result:', formDataResult.success ? '✅ Success' : '❌ Failed');
    if (!formDataResult.success) {
      console.log('Error:', formDataResult.message);
    } else {
      console.log('Created product:', formDataResult.data.name, 'with ID:', formDataResult.data.id);
    }
    
    console.log('\n🎉 Product creation tests completed!');
    
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
        ...(typeof data === 'string' && customHeaders['Content-Type']?.includes('multipart') ? {} : { 'Content-Type': 'application/json' }),
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
          resolve({ raw: responseData, parseError: e.message, status: res.statusCode });
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

testProductCreationModes();
