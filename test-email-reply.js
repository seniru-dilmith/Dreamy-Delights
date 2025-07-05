const https = require('https');

// First, get admin token
const loginData = JSON.stringify({
  username: "admin", // You may need to adjust this
  password: "your-admin-password" // You'll need to provide the correct password
});

const loginOptions = {
  hostname: 'us-central1-dreamy-delights-882ff.cloudfunctions.net',
  path: '/api/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🔐 Attempting admin login...');

const loginReq = https.request(loginOptions, (res) => {
  console.log(`Login Status: ${res.statusCode}`);
  
  res.setEncoding('utf8');
  let loginResponse = '';
  res.on('data', (chunk) => {
    loginResponse += chunk;
  });
  
  res.on('end', () => {
    console.log(`Login Response: ${loginResponse}`);
    
    if (res.statusCode === 200) {
      const parsed = JSON.parse(loginResponse);
      const token = parsed.token;
      
      console.log('✅ Admin login successful!');
      
      // Now test reply functionality
      testReply(token);
    } else {
      console.log('❌ Admin login failed. Please check credentials.');
      console.log('💡 To test the email functionality:');
      console.log('1. Update the username/password in this script');
      console.log('2. Or use the admin dashboard directly');
      console.log('3. Reply to message ID: FR8N8ZvDQHeRjoSOeWGl');
    }
  });
});

function testReply(token) {
  const messageId = 'FR8N8ZvDQHeRjoSOeWGl';
  const replyData = JSON.stringify({
    replyText: 'Thank you for your message! This is a test reply to verify our email functionality is working correctly. If you receive this email, it means our automated email system is functioning properly.'
  });

  const replyOptions = {
    hostname: 'us-central1-dreamy-delights-882ff.cloudfunctions.net',
    path: `/api/api/admin/contact-messages/${messageId}/reply`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': replyData.length
    }
  };

  console.log('📧 Sending reply to test message...');

  const replyReq = https.request(replyOptions, (res) => {
    console.log(`Reply Status: ${res.statusCode}`);
    
    res.setEncoding('utf8');
    let replyResponse = '';
    res.on('data', (chunk) => {
      replyResponse += chunk;
    });
    
    res.on('end', () => {
      console.log(`Reply Response: ${replyResponse}`);
      
      if (res.statusCode === 200) {
        const parsed = JSON.parse(replyResponse);
        console.log('✅ Reply sent successfully!');
        console.log(`Email sent: ${parsed.emailSent ? 'Yes' : 'No'}`);
        if (parsed.emailError) {
          console.log(`Email error: ${parsed.emailError}`);
        }
      } else {
        console.log('❌ Reply failed');
      }
    });
  });

  replyReq.on('error', (e) => {
    console.error(`Reply request error: ${e.message}`);
  });

  replyReq.write(replyData);
  replyReq.end();
}

loginReq.on('error', (e) => {
  console.error(`Login request error: ${e.message}`);
});

loginReq.write(loginData);
loginReq.end();
