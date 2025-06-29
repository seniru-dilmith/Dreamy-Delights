#!/usr/bin/env node

/**
 * Debug script for product update functionality
 * Tests both FormData and JSON modes for product updates
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    storageBucket: 'dreamy-delights-882ff.firebasestorage.app'
  });
}

const db = admin.firestore();

// API configuration
const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app/api';

async function getAdminToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.token) {
      throw new Error('Login response missing token');
    }

    console.log('✅ Admin login successful');
    return data.token;
  } catch (error) {
    console.error('❌ Admin login failed:', error);
    throw error;
  }
}

async function createTestProduct() {
  try {
    console.log('\n🧪 Creating test product for update testing...');
    
    const testProduct = {
      name: 'Test Update Product',
      description: 'A product created for testing updates',
      price: 15.99,
      category: 'Desserts',
      available: true,
      featured: false,
      imageUrl: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'test-script'
    };

    const docRef = await db.collection('products').add(testProduct);
    console.log('✅ Test product created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to create test product:', error);
    throw error;
  }
}

async function testProductUpdateJSON(token, productId) {
  try {
    console.log('\n🧪 Testing product update with JSON...');
    
    const updateData = {
      name: 'Updated Test Product',
      description: 'Updated description via JSON',
      price: 19.99,
      featured: true
    };

    console.log('📤 Sending update request...');
    console.log('🆔 Product ID:', productId);
    console.log('📊 Update data:', updateData);
    console.log('🔐 Token:', token ? 'Present' : 'Missing');

    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📨 Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      result = { success: false, message: 'Invalid JSON response', rawResponse: responseText };
    }

    if (response.ok && result.success) {
      console.log('✅ JSON update successful');
      return { success: true, result };
    } else {
      console.error('❌ JSON update failed:', result);
      return { success: false, result };
    }
  } catch (error) {
    console.error('❌ JSON update request failed:', error);
    return { success: false, error: error.message };
  }
}

async function testProductUpdateFormData(token, productId) {
  try {
    console.log('\n🧪 Testing product update with FormData (no image)...');
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('name', 'Updated Test Product via FormData');
    formData.append('description', 'Updated description via FormData');
    formData.append('price', '25.99');
    formData.append('featured', 'false');

    console.log('📤 Sending FormData update request...');
    console.log('🆔 Product ID:', productId);
    console.log('🔐 Token:', token ? 'Present' : 'Missing');

    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📨 Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      result = { success: false, message: 'Invalid JSON response', rawResponse: responseText };
    }

    if (response.ok && result.success) {
      console.log('✅ FormData update successful');
      return { success: true, result };
    } else {
      console.error('❌ FormData update failed:', result);
      return { success: false, result };
    }
  } catch (error) {
    console.error('❌ FormData update request failed:', error);
    return { success: false, error: error.message };
  }
}

async function verifyProductUpdate(productId) {
  try {
    console.log('\n🔍 Verifying product updates in Firestore...');
    
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      console.error('❌ Product not found in Firestore');
      return false;
    }

    const productData = productDoc.data();
    console.log('📊 Current product data:', productData);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to verify product:', error);
    return false;
  }
}

async function cleanupTestProduct(productId) {
  try {
    console.log('\n🧹 Cleaning up test product...');
    await db.collection('products').doc(productId).delete();
    console.log('✅ Test product deleted');
  } catch (error) {
    console.error('❌ Failed to cleanup test product:', error);
  }
}

async function main() {
  let productId = null;
  
  try {
    console.log('🚀 Starting product update debug test...');
    
    // Step 1: Get admin token
    const token = await getAdminToken();
    
    // Step 2: Create test product
    productId = await createTestProduct();
    
    // Step 3: Test JSON update
    const jsonResult = await testProductUpdateJSON(token, productId);
    
    // Step 4: Verify JSON update
    if (jsonResult.success) {
      await verifyProductUpdate(productId);
    }
    
    // Step 5: Test FormData update
    const formDataResult = await testProductUpdateFormData(token, productId);
    
    // Step 6: Verify FormData update
    if (formDataResult.success) {
      await verifyProductUpdate(productId);
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('JSON Update:', jsonResult.success ? '✅ SUCCESS' : '❌ FAILED');
    console.log('FormData Update:', formDataResult.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (!jsonResult.success) {
      console.log('JSON Error:', jsonResult.result || jsonResult.error);
    }
    if (!formDataResult.success) {
      console.log('FormData Error:', formDataResult.result || formDataResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test script failed:', error);
  } finally {
    // Cleanup
    if (productId) {
      await cleanupTestProduct(productId);
    }
  }
}

// Run the test
main().catch(console.error);
