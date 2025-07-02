// Test creating users through the registration API
const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app';

async function createTestUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpass123',
        displayName: 'Test User'
      }),
    });

    const result = await response.json();
    console.log('User creation result:', result);
    
    if (result.success) {
      console.log('Test user created successfully!');
      console.log('UID:', result.user.uid);
      console.log('Email:', result.user.email);
      console.log('Display Name:', result.user.displayName);
    } else {
      console.error('Failed to create user:', result.message);
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
