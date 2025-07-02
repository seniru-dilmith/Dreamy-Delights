const { initializeApp } = require('firebase/app');
const { httpsCallable, connectFunctionsEmulator, getFunctions } = require('firebase/functions');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "REDACTED_API_KEY",
  authDomain: "dreamy-delights-882ff.firebaseapp.com",
  projectId: "dreamy-delights-882ff",
  storageBucket: "dreamy-delights-882ff.firebasestorage.app",
  messagingSenderId: "797569802450",
  appId: "1:797569802450:web:ac514fae5a3719a31d8d0b",
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Point to production functions
const loginWithGoogle = httpsCallable(functions, 'loginWithGoogle');

async function testGoogleFunction() {
  try {
    console.log('Testing Google login function with dummy token...');
    
    // Test with a dummy token - this should fail but show us the logs
    const result = await loginWithGoogle({ 
      idToken: 'dummy-token-for-testing'
    });
    
    console.log('Function result:', result);
  } catch (error) {
    console.log('Expected error (dummy token):', error.message);
    console.log('Error code:', error.code);
    console.log('Error details:', error.details);
    
    // This confirms the function is accessible and working
    if (error.code === 'unauthenticated' && error.message.includes('Google authentication failed')) {
      console.log('✅ Google function is accessible and working (expected auth failure with dummy token)');
    } else {
      console.log('❌ Unexpected error type');
    }
  }
}

testGoogleFunction();
