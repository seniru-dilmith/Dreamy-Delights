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

async function testRegistration() {
  console.log('Testing user registration...');
  
  try {
    const registerWithEmail = httpsCallable(functions, 'registerWithEmail');
    const result = await registerWithEmail({
      email: 'newuser@dreamydelights.com',
      password: 'test123',
      displayName: 'New Test User'
    });
    
    console.log('Registration successful:', result.data);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}

async function testLogin() {
  console.log('Testing user login...');
  
  try {
    const loginWithEmail = httpsCallable(functions, 'loginWithEmail');
    const result = await loginWithEmail({
      email: 'test@dreamydelights.com',
      password: 'test123'
    });
    
    console.log('Login successful:', result.data);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

async function runTests() {
  await testRegistration();
  await testLogin();
}

runTests().catch(console.error);
