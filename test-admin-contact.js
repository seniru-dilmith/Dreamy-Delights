async function testAdminContactMessages() {
  console.log('🧪 Testing admin contact message functionality...');
  
  const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app/api';
  
  // First, let's get an admin token
  console.log('🔐 Attempting admin login...');
  
  try {
    // Use dynamic import for fetch
    const fetch = (await import('node-fetch')).default;
    
    // Login as admin
    const loginResponse = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      console.error('❌ Admin login failed');
      console.error('Status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.error('Error:', errorText);
      return;
    }

    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.error('❌ Admin login failed:', loginResult.message);
      return;
    }

    console.log('✅ Admin login successful!');
    const authToken = loginResult.token;
    
    // Test fetching contact messages
    console.log('📧 Fetching contact messages...');
    
    const messagesResponse = await fetch(`${API_BASE_URL}/admin/contact-messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    });

    if (!messagesResponse.ok) {
      console.error('❌ Failed to fetch contact messages');
      console.error('Status:', messagesResponse.status);
      const errorText = await messagesResponse.text();
      console.error('Error:', errorText);
      return;
    }

    const messagesResult = await messagesResponse.json();
    
    if (messagesResult.success) {
      console.log('✅ Contact messages fetched successfully!');
      console.log('📊 Total messages:', messagesResult.count);
      console.log('📋 Messages:', messagesResult.data.length > 0 ? 'Found messages' : 'No messages');
      
      if (messagesResult.data.length > 0) {
        const firstMessage = messagesResult.data[0];
        console.log('📧 First message details:');
        console.log('  - ID:', firstMessage.id);
        console.log('  - From:', firstMessage.firstName, firstMessage.lastName);
        console.log('  - Email:', firstMessage.email);
        console.log('  - Subject:', firstMessage.subject);
        console.log('  - Status:', firstMessage.status);
      }
    } else {
      console.error('❌ Failed to fetch contact messages:', messagesResult.message);
    }

    // Test fetching contact message stats
    console.log('📊 Fetching contact message stats...');
    
    const statsResponse = await fetch(`${API_BASE_URL}/admin/contact-messages/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    });

    if (statsResponse.ok) {
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        console.log('✅ Contact message stats fetched successfully!');
        console.log('📈 Stats:', statsResult.data);
      }
    } else {
      console.error('❌ Failed to fetch contact message stats');
    }

  } catch (error) {
    console.error('❌ Error testing admin contact message functionality:', error.message);
  }
}

// Run the test
testAdminContactMessages();
