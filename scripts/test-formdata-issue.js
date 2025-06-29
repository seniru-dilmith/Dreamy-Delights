// Test FormData issue specifically
const fs = require('fs');

async function testFormDataIssue() {
  try {
    console.log('=== Testing FormData Issue ===');
    
    // Generate admin token
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({
      id: 'test-admin-id',
      adminId: 'test-admin-id',
      username: 'admin',
      role: 'super_admin',
      permissions: ['manage_products', 'manage_orders', 'view_analytics'],
      type: 'admin'
    }, 'fallback-secret-change-in-production', { expiresIn: '24h' });
    
    // Test simple form submission without multer (should work)
    console.log('📄 Testing simple form data (text only)...');
    
    const textFormData = 'name=Simple%20Test&description=Test%20description&price=1.99&category=Cakes&stock=5&featured=false&active=true';
    
    const textResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + testToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: textFormData
    });
    
    console.log('Text form response status:', textResponse.status);
    
    if (textResponse.ok) {
      const textData = await textResponse.json();
      console.log('✅ Simple form data worked:', textData);
    } else {
      const errorText = await textResponse.text();
      console.log('❌ Simple form data failed:', errorText);
    }
    
    // Test actual issue diagnosis
    console.log('\n📸 Testing FormData diagnosis...');
    
    // Let's check what happens if we send a minimal FormData request
    const FormData = require('form-data');
    const minimalForm = new FormData();
    minimalForm.append('name', 'Minimal Test');
    minimalForm.append('price', '2.99');
    minimalForm.append('category', 'Cakes');
    minimalForm.append('description', 'Minimal test product');
    
    console.log('Sending minimal FormData...');
    console.log('Headers that will be sent:', minimalForm.getHeaders());
    
    const minimalResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + testToken,
        ...minimalForm.getHeaders()
      },
      body: minimalForm
    });
    
    console.log('Minimal FormData response status:', minimalResponse.status);
    
    if (minimalResponse.ok) {
      const minimalData = await minimalResponse.json();
      console.log('✅ Minimal FormData worked:', minimalData);
    } else {
      const errorText = await minimalResponse.text();
      console.log('❌ Minimal FormData failed:', errorText);
      
      // Try to get more detailed error info
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Error details:', errorJson);
      } catch {
        console.log('Raw error text:', errorText.substring(0, 500));
      }
    }
    
  } catch (error) {
    console.error('Error in FormData test:', error);
  }
}

testFormDataIssue();
