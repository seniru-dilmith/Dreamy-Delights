const fs = require('fs');
const path = require('path');

// Configuration: List your files and the desired Secret Name
const filesToProcess = [
    { 
        filePath: '.env', 
        secretName: 'FRONTEND_ENV' 
    },
    { 
        filePath: 'functions/.env', 
        secretName: 'BACKEND_ENV' 
    },
    { 
        // Update this filename to match your exact key file name
        filePath: 'functions/dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json', 
        secretName: 'FIREBASE_SERVICE' 
    }
];

console.log('\n🔵 --- GENERATING GITHUB SECRETS ---\n');

filesToProcess.forEach(item => {
    try {
        const fullPath = path.join(__dirname, item.filePath);
        
        if (fs.existsSync(fullPath)) {
            // Read the file and convert to Base64
            const fileContent = fs.readFileSync(fullPath);
            const base64String = fileContent.toString('base64');
            
            console.log(`✅ SECRET NAME: ${item.secretName}`);
            console.log(`(Copy the string below and paste into GitHub Secrets)\n`);
            console.log(base64String);
            console.log('\n---------------------------------------------------\n');
        } else {
            console.error(`❌ File not found: ${item.filePath}`);
            console.error('Make sure the file exists before running this script.\n');
        }
    } catch (error) {
        console.error(`Error processing ${item.filePath}:`, error.message);
    }
});
