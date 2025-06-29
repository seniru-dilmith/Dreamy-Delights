// Test script to verify frontend API integration
const fetch = require('node-fetch');

async function testFrontendAPI() {
  try {
    console.log('=== Testing Frontend API Integration ===');
    
    // Test 1: Featured products endpoint
    console.log('1️⃣ Testing featured products endpoint...');
    const featuredResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/products/featured');
    const featuredData = await featuredResponse.json();
    
    if (featuredResponse.ok && featuredData.success) {
      console.log('✅ Featured products endpoint working');
      console.log(`   Found ${featuredData.data.length} featured products`);
      
      if (featuredData.data.length > 0) {
        const sampleProduct = featuredData.data[0];
        console.log('   Sample product structure:');
        console.log('   - ID:', sampleProduct.id);
        console.log('   - Name:', sampleProduct.name);
        console.log('   - Price:', sampleProduct.price);
        console.log('   - Image URL:', sampleProduct.imageUrl ? '✓' : '✗');
        console.log('   - Featured:', sampleProduct.featured);
      }
    } else {
      console.log('❌ Featured products endpoint failed:', featuredData);
    }
    
    // Test 2: All products endpoint  
    console.log('2️⃣ Testing all products endpoint...');
    const allResponse = await fetch('https://api-cvfhs7orea-uc.a.run.app/api/products?limit=5');
    const allData = await allResponse.json();
    
    if (allResponse.ok && allData.success) {
      console.log('✅ All products endpoint working');
      console.log(`   Found ${allData.data.length} products`);
      
      // Check for products with images
      const withImages = allData.data.filter(p => p.imageUrl);
      console.log(`   Products with images: ${withImages.length}/${allData.data.length}`);
    } else {
      console.log('❌ All products endpoint failed:', allData);
    }
    
    // Test 3: Test image accessibility
    console.log('3️⃣ Testing image accessibility...');
    if (featuredData.success && featuredData.data.length > 0) {
      const productWithImage = featuredData.data.find(p => p.imageUrl);
      if (productWithImage) {
        const imageResponse = await fetch(productWithImage.imageUrl);
        if (imageResponse.ok) {
          console.log('✅ Product images are accessible');
          console.log('   Sample image URL:', productWithImage.imageUrl);
        } else {
          console.log('❌ Product images not accessible:', imageResponse.status);
        }
      } else {
        console.log('⚠️ No products with images found for testing');
      }
    }
    
    console.log('\n🎯 Frontend API Integration Test Complete');
    
  } catch (error) {
    console.error('❌ Error testing frontend API:', error);
  }
}

testFrontendAPI();
