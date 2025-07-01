const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Firebase configuration
const firebaseConfig = {
  projectId: "dreamy-delights-882ff",
  authDomain: "dreamy-delights-882ff.firebaseapp.com",
  apiKey: "AIzaSyB318h5Mq0IhSzui9y96mkPJ0oaQqzwQgs",
  appId: "1:797569802450:web:ac514fae5a3719a31d8d0b",
  storageBucket: "dreamy-delights-882ff.firebasestorage.app",
  messagingSenderId: "797569802450",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

async function testCompleteFlow() {
  const testEmail = `user${Date.now()}@dreamydelights.com`;
  const testPassword = 'test123';
  const testName = 'Test User Complete';

  console.log('\n=== Testing Complete Authentication Flow ===');
  console.log(`Testing with email: ${testEmail}`);

  // Test 1: Registration
  console.log('\n1. Testing Registration...');
  try {
    const registerWithEmail = httpsCallable(functions, 'registerWithEmail');
    const regResult = await registerWithEmail({
      email: testEmail,
      password: testPassword,
      displayName: testName
    });
    
    console.log('✅ Registration successful!');
    console.log('User ID:', regResult.data.user.uid);
    console.log('Email:', regResult.data.user.email);
    console.log('Role:', regResult.data.user.role);
  } catch (error) {
    console.log('❌ Registration failed:', error.message);
    return;
  }

  // Test 2: Login
  console.log('\n2. Testing Login...');
  try {
    const loginWithEmail = httpsCallable(functions, 'loginWithEmail');
    const loginResult = await loginWithEmail({
      email: testEmail,
      password: testPassword
    });
    
    console.log('✅ Login successful!');
    console.log('User ID:', loginResult.data.user.uid);
    console.log('Email:', loginResult.data.user.email);
    console.log('Role:', loginResult.data.user.role);
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    return;
  }

  console.log('\n🎉 Complete authentication flow working perfectly!');
}

testCompleteFlow().catch(console.error);
