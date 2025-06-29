// Test script to simulate admin panel login and product creation workflow

async function simulateAdminPanelFlow() {
  console.log('🧪 Simulating Admin Panel Authentication Flow...');
  
  // Step 1: Simulate admin login through the admin panel
  console.log('\n1. Testing admin login...');
  
  try {
    const loginResponse = await fetch('https://us-central1-dreamy-delights-882ff.cloudfunctions.net/adminLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          username: 'admin',
          password: 'admin123'
        }
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Admin login successful:', loginData.result.success);
    
    if (!loginData.result.success) {
      console.log('❌ Admin login failed, stopping test');
      return;
    }
    
    const adminToken = loginData.result.token;
    console.log('✅ Received admin token');
    
    // Step 2: Simulate storing token in localStorage (like AdminContext does)
    if (typeof window !== 'undefined') {
      // For browser environment
      const { ClientEncryption } = require('@/utils/encryption');
      const tokenData = {
        token: adminToken,
        timestamp: Date.now(),
      };
      const encryptedToken = ClientEncryption.encrypt(JSON.stringify(tokenData));
      localStorage.setItem('dreamy_admin_token', encryptedToken);
      console.log('✅ Token stored in localStorage (encrypted)');
    }
    
    // Step 3: Test product creation with image upload
    console.log('\n2. Testing product creation with image...');
    
    // Create FormData similar to what the admin panel does
    const formData = new FormData();
    formData.append('name', 'Test Product from Panel');
    formData.append('description', 'This is a test product created through the simulated admin panel');
    formData.append('price', '39.99');
    formData.append('category', 'Cakes');
    formData.append('stock', '10');
    formData.append('featured', 'true');
    formData.append('active', 'true');
    
    // Simulate image file (create a minimal valid image)
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    canvas.toBlob(async (blob) => {
      if (blob) {
        formData.append('image', blob, 'test-image.png');
        
        // Make the request
        const productResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`
            // Note: No Content-Type header for FormData
          },
          body: formData
        });
        
        const productData = await productResponse.json();
        console.log('✅ Product creation response:', productData);
        
        if (productData.success) {
          console.log('🎉 Product created successfully with ID:', productData.data.id);
        } else {
          console.log('❌ Product creation failed:', productData.message);
        }
      }
    }, 'image/png');
    
  } catch (error) {
    console.error('❌ Error in admin panel simulation:', error);
  }
}

// Test token retrieval function (like in firebase/api.ts)
function testTokenRetrieval() {
  console.log('\n3. Testing token retrieval (like firebase/api.ts does)...');
  
  try {
    const encryptedToken = localStorage.getItem('dreamy_admin_token');
    if (!encryptedToken) {
      console.log('❌ No token found in localStorage');
      return null;
    }

    const { ClientEncryption } = require('@/utils/encryption');
    const tokenData = JSON.parse(ClientEncryption.decrypt(encryptedToken));
    
    // Check if token is expired (4 hours)
    const ADMIN_SESSION_DURATION = 4 * 60 * 60 * 1000;
    if (Date.now() - tokenData.timestamp > ADMIN_SESSION_DURATION) {
      console.log('❌ Token expired');
      localStorage.removeItem('dreamy_admin_token');
      return null;
    }
    
    console.log('✅ Token retrieved successfully');
    return tokenData.token;
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    localStorage.removeItem('dreamy_admin_token');
    return null;
  }
}

// Run the simulation if in browser environment
if (typeof window !== 'undefined') {
  simulateAdminPanelFlow().then(() => {
    setTimeout(() => {
      testTokenRetrieval();
    }, 1000);
  });
} else {
  console.log('This test needs to be run in a browser environment');
}

export { simulateAdminPanelFlow, testTokenRetrieval };
