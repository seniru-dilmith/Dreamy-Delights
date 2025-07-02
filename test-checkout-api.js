// Test script to verify the checkout API endpoint works
const FUNCTIONS_URL = 'https://us-central1-dreamy-delights-882ff.cloudfunctions.net/api';

async function testCheckoutAPI() {
  console.log('Testing checkout API endpoint...');
  
  try {
    // Test basic API connectivity
    const healthResponse = await fetch(`${FUNCTIONS_URL}/health`);
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);
    }
    
    // Test CORS preflight (this is what was failing)
    console.log('\nTesting CORS preflight...');
    const corsResponse = await fetch(`${FUNCTIONS_URL}/orders`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('CORS preflight status:', corsResponse.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers')
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCheckoutAPI();
