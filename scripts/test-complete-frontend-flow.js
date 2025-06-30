/**
 * Test the exact frontend login flow and products fetch
 */

const API_BASE_URL = 'https://us-central1-dreamy-delights-882ff.cloudfunctions.net/api/api';

// Simulate the ClientEncryption class for testing
class TestEncryption {
  static encrypt(data) {
    // Simple base64 encoding for testing (not secure, just for simulation)
    return Buffer.from(data).toString('base64');
  }
  
  static decrypt(data) {
    // Simple base64 decoding for testing
    return Buffer.from(data, 'base64').toString();
  }
}

// Simulate localStorage for testing
const testStorage = new Map();
const testLocalStorage = {
  getItem: (key) => testStorage.get(key) || null,
  setItem: (key, value) => testStorage.set(key, value),
  removeItem: (key) => testStorage.delete(key)
};

// Simulate the admin token functions
const ADMIN_TOKEN_KEY = 'dreamy_admin_token';
const ADMIN_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

function getAdminToken() {
  try {
    const encryptedToken = testLocalStorage.getItem(ADMIN_TOKEN_KEY);
    if (!encryptedToken) return null;

    const tokenData = JSON.parse(TestEncryption.decrypt(encryptedToken));
    
    // Check if token is expired
    if (Date.now() - tokenData.timestamp > ADMIN_SESSION_DURATION) {
      testLocalStorage.removeItem(ADMIN_TOKEN_KEY);
      return null;
    }
    
    return tokenData.token;
  } catch (error) {
    console.error('Error getting admin token:', error);
    testLocalStorage.removeItem(ADMIN_TOKEN_KEY);
    return null;
  }
}

function setAdminToken(token) {
  if (token) {
    try {
      const tokenData = {
        token,
        timestamp: Date.now(),
      };
      const encryptedToken = TestEncryption.encrypt(JSON.stringify(tokenData));
      testLocalStorage.setItem(ADMIN_TOKEN_KEY, encryptedToken);
    } catch (error) {
      console.error('Error setting admin token:', error);
    }
  } else {
    testLocalStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

async function fetchWithAdminAuth(url, options = {}) {
  const token = getAdminToken();
  console.log('🔧 fetchWithAdminAuth: Token available:', !!token);
  
  if (!token) {
    throw new Error('No admin token available');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Simulate the frontend login function
async function adminLogin(credentials) {
  try {
    console.log('🔐 Frontend Login: Starting login with credentials:', credentials.username);
    
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('🔐 Frontend Login: Response status:', response.status);
    const result = await response.json();
    console.log('🔐 Frontend Login: Response data:', result);

    if (result.success && result.token) {
      console.log('🔐 Frontend Login: Setting token...');
      setAdminToken(result.token);
      return result;
    }

    return result;
  } catch (error) {
    console.error('🔐 Frontend Login: Error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Simulate the frontend products fetch function
async function adminFetchProducts() {
  try {
    console.log('🛍️ Frontend Products: Starting fetch...');
    console.log('- URL:', `${API_BASE_URL}/admin/products`);
    
    const token = getAdminToken();
    console.log('- Token available:', !!token);
    console.log('- Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      console.warn('No admin token available for products fetch');
      return {
        success: false,
        message: 'No authentication token',
        data: []
      };
    }

    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products`);
    const result = await response.json();
    
    console.log('📦 Frontend Products: Response:', {
      success: result.success,
      dataCount: result.data?.length || 0,
      message: result.message
    });
    
    if (result.success && result.data) {
      console.log('✅ Products loaded successfully:', result.data.length, 'products');
      result.data.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error fetching admin products:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}

// Run the test
async function runFrontendFlowTest() {
  console.log('🧪 Starting Frontend Flow Test...\n');
  
  // Test 0: Health check
  console.log('0. Testing API health...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
  
  // Test 1: Login
  console.log('1. Testing admin login...');
  const loginResult = await adminLogin({
    username: 'admin',
    password: 'admin123'
  });
  
  if (!loginResult.success) {
    console.error('❌ Login failed, stopping test');
    return;
  }
  
  console.log('✅ Login successful!\n');
  
  // Test 2: Fetch products
  console.log('2. Testing products fetch...');
  const productsResult = await adminFetchProducts();
  
  if (productsResult.success) {
    console.log('✅ Products fetch successful!');
    console.log('📊 Summary:', {
      totalProducts: productsResult.data.length,
      firstProduct: productsResult.data[0]?.name || 'None'
    });
  } else {
    console.error('❌ Products fetch failed:', productsResult.message);
  }
  
  console.log('\n🧪 Frontend Flow Test Complete!');
}

runFrontendFlowTest();
