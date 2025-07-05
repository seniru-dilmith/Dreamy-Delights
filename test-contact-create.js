const https = require('https');

const data = JSON.stringify({
  firstName: "Test",
  lastName: "User", 
  email: "test@example.com",
  phone: "123-456-7890",
  subject: "Email Reply Test",
  message: "This is a test message to verify the email reply functionality works correctly."
});

const options = {
  hostname: 'us-central1-dreamy-delights-882ff.cloudfunctions.net',
  path: '/api/api/contact',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
  res.on('end', () => {
    console.log('Request completed.');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
