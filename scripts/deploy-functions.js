/**
 * Deploy Firebase Cloud Functions
 * Run this to deploy the updated testimonial routes
 */

const { execSync } = require('child_process');
const path = require('path');

async function deployFunctions() {
  try {
    console.log('🚀 Deploying Firebase Cloud Functions...');
    
    // Navigate to functions directory
    const functionsDir = path.join(__dirname, '../functions');
    process.chdir(functionsDir);
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Deploy functions
    console.log('🔧 Deploying functions...');
    execSync('firebase deploy --only functions', { stdio: 'inherit' });
    
    console.log('✅ Deployment complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Test the testimonial CRUD operations in the admin panel');
    console.log('2. Use the Debug Panel to troubleshoot any issues');
    console.log('3. Check the Firebase Console for function logs if needed');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Make sure Firebase CLI is installed: npm install -g firebase-tools');
    console.log('2. Make sure you are logged in: firebase login');
    console.log('3. Check that firebase.json is configured correctly');
  }
}

deployFunctions();
