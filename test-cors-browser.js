/**
 * Browser Console Test for CORS Fix
 * 
 * Copy and paste this into your browser console while on localhost:3000
 * to test if CORS issues are resolved.
 */

console.log("🔧 Testing CORS fix...");

// Test 1: Basic health check
fetch('https://api-cvfhs7orea-uc.a.run.app/api/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => {
  console.log("✅ Health check - Response status:", response.status);
  console.log("✅ Health check - CORS headers present:", 
    response.headers.get('access-control-allow-origin'));
  return response.json();
})
.then(data => {
  console.log("✅ Health check - Data:", data);
})
.catch(error => {
  console.error("❌ Health check failed:", error);
});

// Test 2: Admin endpoint (should fail with 401 but not CORS error)
fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => {
  console.log("✅ Admin endpoint - Response status:", response.status);
  console.log("✅ Admin endpoint - CORS headers present:", 
    response.headers.get('access-control-allow-origin'));
  console.log("✅ Admin endpoint - Should be 401 (unauthorized) but no CORS error");
  return response.json();
})
.then(data => {
  console.log("✅ Admin endpoint - Data:", data);
})
.catch(error => {
  console.error("❌ Admin endpoint failed:", error);
});

// Test 3: OPTIONS preflight request
fetch('https://api-cvfhs7orea-uc.a.run.app/api/admin/products/test-id', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'PUT',
    'Access-Control-Request-Headers': 'Content-Type, Authorization'
  }
})
.then(response => {
  console.log("✅ OPTIONS preflight - Response status:", response.status);
  console.log("✅ OPTIONS preflight - Allow origin:", 
    response.headers.get('access-control-allow-origin'));
  console.log("✅ OPTIONS preflight - Allow methods:", 
    response.headers.get('access-control-allow-methods'));
  console.log("✅ OPTIONS preflight - Allow headers:", 
    response.headers.get('access-control-allow-headers'));
})
.catch(error => {
  console.error("❌ OPTIONS preflight failed:", error);
});

console.log("🔧 CORS tests initiated. Check results above.");
console.log("If you see ✅ with status codes and CORS headers, CORS is working!");
console.log("If you see ❌ with CORS policy errors, there's still an issue.");
