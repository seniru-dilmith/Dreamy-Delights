const BASE_URL = 'https://us-central1-dreamy-delights-882ff.cloudfunctions.net/api';

async function testAdminLoginAndProducts() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Test login with admin credentials
    const loginResponse = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('Login Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful, got token');
    
    // Test products API with token
    console.log('🛍️ Testing products API...');
    const productsResponse = await fetch(`${BASE_URL}/admin/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Products Status:', productsResponse.status);
    const productsData = await productsResponse.json();
    console.log('Products Response:', productsData);
    
    if (productsData.success) {
      console.log('✅ Products API working, found', productsData.data.length, 'products');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminLoginAndProducts();
