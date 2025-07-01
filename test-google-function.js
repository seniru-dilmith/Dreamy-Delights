const fetch = require('node-fetch');

async function testGoogleLoginFunction() {
  try {
    console.log('Testing deployed Google login function...');
    
    // We need a real Google ID token to test this properly
    // For now, let's just test that the function is accessible
    const functionUrl = 'https://api-cvfhs7orea-uc.a.run.app/loginWithGoogle';
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          idToken: 'dummy-token'
        }
      })
    });
    
    const result = await response.json();
    console.log('Function response status:', response.status);
    console.log('Function response:', result);
    
    // This should fail with invalid token, but shows function is accessible
    
  } catch (error) {
    console.error('Error testing function:', error);
  }
}

testGoogleLoginFunction();
