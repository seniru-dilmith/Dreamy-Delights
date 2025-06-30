/**
 * Simple test to verify the admin API is working in the frontend
 */

import { adminFetchProducts } from './firebase/api';

async function testProducts() {
  console.log('Testing admin products API...');
  try {
    const result = await adminFetchProducts();
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test when page loads
if (typeof window !== 'undefined') {
  testProducts();
}
