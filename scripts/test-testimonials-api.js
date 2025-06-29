/**
 * Test script for testimonials functionality
 * Run this to test the testimonials admin functionality
 */

const https = require('https');

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app';

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${path}`;
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testTestimonials() {
  try {
    console.log('🧪 Testing Testimonials API...');

    // Test 1: Fetch all testimonials
    console.log('\n1. Fetching all testimonials...');
    const fetchResponse = await makeRequest('/api/testimonials');
    console.log(`Status: ${fetchResponse.status}`);
    console.log('Testimonials:', fetchResponse.data);

    // Test 2: Fetch featured testimonials
    console.log('\n2. Fetching featured testimonials...');
    const featuredResponse = await makeRequest('/api/testimonials/featured');
    console.log(`Status: ${featuredResponse.status}`);
    console.log('Featured testimonials:', featuredResponse.data);

    // Test 3: Create a testimonial without auth (should fail)
    console.log('\n3. Creating testimonial without auth (should fail)...');
    const createResponse = await makeRequest('/api/testimonials', {
      method: 'POST',
      body: {
        name: 'Test Customer',
        content: 'This is a test testimonial for the admin panel.',
        rating: 5,
        featured: true
      }
    });
    console.log(`Status: ${createResponse.status}`);
    console.log('Create response:', createResponse.data);
    const createData = await createResponse.json();
    console.log('\n✅ Testimonials API test completed!');
  } catch (error) {
    console.error('❌ Error testing testimonials API:', error);
  }
}

// Run the test
testTestimonials();
