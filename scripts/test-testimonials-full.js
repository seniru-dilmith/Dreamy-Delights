/**
 * Complete testimonials test with admin authentication
 */

const admin = require('firebase-admin');
const https = require('https');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dreamy-delights-882ff-default-rtdb.firebaseio.com"
  });
}

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app';

function makeRequest(path, options = {}) {
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

async function testTestimonialsWithAuth() {
  console.log('🧪 Testing Testimonials CRUD with Admin Authentication...\n');
  
  try {
    // Step 1: Get admin token
    console.log('1. Getting admin token...');
    const adminUID = 'E9piD0HPFuYIBK8PferpvP79PXx1'; // From the created admin
    const adminToken = await admin.auth().createCustomToken(adminUID);
    console.log('✅ Admin token created');
    
    // Step 2: Test fetching testimonials (public endpoint)
    console.log('\n2. Fetching all testimonials (public)...');
    const allTestimonials = await makeRequest('/api/testimonials');
    console.log(`Status: ${allTestimonials.status}`);
    console.log(`Found ${allTestimonials.data.data?.length || 0} testimonials`);
    
    // Step 3: Create a new testimonial with admin auth
    console.log('\n3. Creating new testimonial with admin auth...');
    const newTestimonial = {
      name: 'Test Customer via API',
      content: 'This is a test testimonial created via API with admin authentication.',
      rating: 5,
      featured: true
    };
    
    const createResponse = await makeRequest('/api/testimonials', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: newTestimonial
    });
    
    console.log(`Create Status: ${createResponse.status}`);
    if (createResponse.status === 201 && createResponse.data.success) {
      const createdId = createResponse.data.data.id;
      console.log(`✅ Created testimonial with ID: ${createdId}`);
      
      // Step 4: Update the testimonial
      console.log('\n4. Updating testimonial...');
      const updateData = {
        content: 'This is an UPDATED test testimonial via API.',
        featured: false
      };
      
      const updateResponse = await makeRequest(`/api/testimonials/${createdId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: updateData
      });
      
      console.log(`Update Status: ${updateResponse.status}`);
      if (updateResponse.data.success) {
        console.log('✅ Testimonial updated successfully');
      } else {
        console.log('❌ Update failed:', updateResponse.data);
      }
      
      // Step 5: Delete the testimonial
      console.log('\n5. Deleting testimonial...');
      const deleteResponse = await makeRequest(`/api/testimonials/${createdId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log(`Delete Status: ${deleteResponse.status}`);
      if (deleteResponse.data.success) {
        console.log('✅ Testimonial deleted successfully');
      } else {
        console.log('❌ Delete failed:', deleteResponse.data);
      }
      
    } else {
      console.log('❌ Create failed:', createResponse.data);
    }
    
    // Step 6: Test without auth (should fail)
    console.log('\n6. Testing create without auth (should fail)...');
    const noAuthResponse = await makeRequest('/api/testimonials', {
      method: 'POST',
      body: {
        name: 'Should Fail',
        content: 'This should fail without auth',
        rating: 1
      }
    });
    
    console.log(`No Auth Status: ${noAuthResponse.status}`);
    if (noAuthResponse.status === 401) {
      console.log('✅ Correctly rejected unauthorized request');
    } else {
      console.log('❌ Unexpected response for unauthorized request:', noAuthResponse.data);
    }
    
    console.log('\n🎉 All testimonials CRUD tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTestimonialsWithAuth();
