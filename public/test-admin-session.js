// Test script to verify admin session persistence
// This should be run in the browser console

async function testAdminSessionPersistence() {
  console.log('🧪 Testing Admin Session Persistence...');
  
  // Step 1: Check if admin context is available
  console.log('\n1. Checking AdminContext availability...');
  
  // Check if localStorage has any admin token
  const encryptedToken = localStorage.getItem('dreamy_admin_token');
  console.log('Encrypted token in localStorage:', encryptedToken ? 'Present' : 'Not found');
  
  if (encryptedToken) {
    console.log('\n2. Attempting to decrypt token...');
    try {
      // Import encryption utility (this assumes you're running in the app context)
      const { ClientEncryption } = require('@/utils/encryption');
      const tokenData = JSON.parse(ClientEncryption.decrypt(encryptedToken));
      
      console.log('Token timestamp:', new Date(tokenData.timestamp));
      console.log('Token age:', Date.now() - tokenData.timestamp, 'ms');
      
      // Decode JWT
      const tokenParts = tokenData.token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('JWT payload:', payload);
        console.log('JWT expires at:', new Date(payload.exp * 1000));
        console.log('JWT is expired:', payload.exp * 1000 < Date.now());
      }
    } catch (error) {
      console.error('Error decrypting token:', error);
    }
  }
  
  console.log('\n3. Test complete - check console logs above');
}

// Instructions for manual testing
console.log(`
🧪 ADMIN SESSION PERSISTENCE TEST

To test admin session persistence:

1. Open browser dev tools (F12)
2. Go to http://localhost:3000/admin/login
3. Login with: username="admin", password="admin123"  
4. After successful login and redirect to dashboard
5. Refresh the page (F5)
6. You should remain logged in (not redirected back to login)

To debug issues:
1. Check console logs for "AdminContext:" messages
2. Check localStorage for "dreamy_admin_token"
3. Run testAdminSessionPersistence() in console

Expected behavior:
- ✅ Login stores encrypted token in localStorage
- ✅ Page refresh checks localStorage and restores session
- ✅ Expired tokens are automatically cleared
- ✅ Admin remains logged in across page refreshes
`);

// Export for console use
window.testAdminSessionPersistence = testAdminSessionPersistence;
