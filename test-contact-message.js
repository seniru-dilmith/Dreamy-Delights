// Remove the require statement

async function testContactMessageSubmission() {
  console.log('🧪 Testing contact message submission...');
  
  const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app/api';
  
  const testMessage = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+1234567890',
    subject: 'Test Contact Message',
    message: 'This is a test message to verify the contact form functionality is working properly.'
  };

  try {
    // Use dynamic import for fetch
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Contact message submitted successfully!');
      console.log('📧 Message ID:', result.data.id);
      console.log('📊 Status:', result.data.status);
      console.log('📅 Created at:', result.data.createdAt);
      console.log('💬 Message:', result.message);
    } else {
      console.error('❌ Failed to submit contact message');
      console.error('📝 Response:', result);
    }
  } catch (error) {
    console.error('❌ Error testing contact message submission:', error.message);
  }
}

// Run the test
testContactMessageSubmission();
