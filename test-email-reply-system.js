const https = require('https');

// Base URL for your deployed functions
const BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app/api';

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseBody);
          resolve(jsonResponse);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testContactFormAndReply() {
  console.log('🧪 Testing Contact Form and Email Reply System');
  console.log('==============================================');
  
  try {
    // Step 1: Create a test contact message
    console.log('\n1. Creating test contact message...');
    
    const contactData = {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@example.com', // Replace with your email to receive test reply
      phone: '+1234567890',
      subject: 'Test Contact Form Message',
      message: 'This is a test message to verify the contact form and email reply system is working correctly.'
    };
    
    const contactResult = await makeRequest(`${BASE_URL}/contact`, 'POST', contactData);
    
    if (contactResult.success) {
      console.log('✅ Contact message created successfully');
      console.log(`📧 Message ID: ${contactResult.data.id}`);
      
      // Step 2: Instructions for admin testing
      console.log('\n2. Manual testing steps:');
      console.log('   a. Log into your admin dashboard');
      console.log('   b. Go to the Messages tab');
      console.log(`   c. Find the message from "${contactData.firstName} ${contactData.lastName}"`);
      console.log('   d. Click the Reply button');
      console.log('   e. Write a test reply and submit');
      console.log('   f. Check the response message for email status');
      
      console.log('\n💡 Email Configuration Status:');
      console.log('   - If you see "Reply sent successfully and email delivered!" → ✅ Email working');
      console.log('   - If you see "Email not sent: [error]" → ❌ Check your email configuration');
      
      console.log('\n📝 To set up email:');
      console.log('   - Follow the instructions in EMAIL_SETUP.md');
      console.log('   - Configure your Gmail App Password in environment variables');
      console.log('   - Redeploy functions after configuration');
      
    } else {
      console.log('❌ Failed to create contact message:', contactResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testContactFormAndReply();
