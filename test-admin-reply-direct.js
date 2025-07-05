const https = require('https');

// Test admin login and reply
async function testAdminReply() {
  console.log('🧪 Testing Admin Reply Endpoint');
  console.log('==============================');
  
  // Step 1: Test admin login
  console.log('\n1. Testing admin login...');
  
  const loginData = JSON.stringify({
    username: "admin", // You may need to adjust this
    password: "password123" // You may need to adjust this  
  });

  const loginOptions = {
    hostname: 'api-cvfhs7orea-uc.a.run.app',
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  const loginReq = https.request(loginOptions, (res) => {
    console.log(`Login Status: ${res.statusCode}`);
    
    res.setEncoding('utf8');
    let loginResponse = '';
    res.on('data', (chunk) => {
      loginResponse += chunk;
    });
    
    res.on('end', () => {
      console.log('Login Response:', loginResponse);
      
      if (res.statusCode === 200) {
        const parsed = JSON.parse(loginResponse);
        const token = parsed.token;
        console.log('✅ Login successful, testing reply...');
        testReplyEndpoint(token);
      } else {
        console.log('❌ Login failed. Response:');
        console.log(loginResponse);
        console.log('\n💡 Update the username/password in this script to match your admin credentials');
      }
    });
  });

  loginReq.on('error', (e) => {
    console.error(`Login error: ${e.message}`);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testReplyEndpoint(token) {
  console.log('\n2. Testing reply endpoint...');
  
  // Test with the message we created earlier
  const messageId = 'FR8N8ZvDQHeRjoSOeWGl';
  const replyData = JSON.stringify({
    replyText: 'Test reply from endpoint validation'
  });

  const replyOptions = {
    hostname: 'api-cvfhs7orea-uc.a.run.app',
    path: `/api/admin/contact-messages/${messageId}/reply`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': replyData.length
    }
  };

  console.log('Reply URL:', `https://api-cvfhs7orea-uc.a.run.app${replyOptions.path}`);

  const replyReq = https.request(replyOptions, (res) => {
    console.log(`Reply Status: ${res.statusCode}`);
    console.log('Reply Headers:', Object.fromEntries(Object.entries(res.headers).slice(0, 5)));
    
    res.setEncoding('utf8');
    let replyResponse = '';
    res.on('data', (chunk) => {
      replyResponse += chunk;
    });
    
    res.on('end', () => {
      console.log('Reply Response:', replyResponse);
      
      if (res.statusCode === 200) {
        console.log('✅ Reply endpoint works!');
      } else {
        console.log('❌ Reply endpoint failed');
      }
    });
  });

  replyReq.on('error', (e) => {
    console.error(`Reply error: ${e.message}`);
  });

  replyReq.write(replyData);
  replyReq.end();
}

testAdminReply();
