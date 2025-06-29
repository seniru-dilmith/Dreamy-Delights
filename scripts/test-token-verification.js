const https = require('https');

async function testTokenVerification() {
  console.log('🔍 Testing Admin Token Verification...');
  
  try {
    // Step 1: Get a fresh admin token
    console.log('\n1. Getting fresh admin token...');
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
    
    if (!loginResponse.result.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const adminToken = loginResponse.result.token;
    console.log('✅ Got fresh token');
    
    // Step 2: Test token verification
    console.log('\n2. Testing token verification...');
    const verifyResponse = await makeRequest('POST',
      'us-central1-dreamy-delights-882ff.cloudfunctions.net',
      '/verifyAdminToken',
      {
        data: {
          token: adminToken
        }
      }
    );
    
    console.log('Token verification result:', JSON.stringify(verifyResponse, null, 2));
    
    if (verifyResponse.result && verifyResponse.result.valid) {
      console.log('✅ Token verification successful');
      console.log('Admin data:', verifyResponse.result.admin);
    } else {
      console.log('❌ Token verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function makeRequest(method, hostname, path, data, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
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
          resolve({ raw: responseData, parseError: e.message });
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

testTokenVerification();
