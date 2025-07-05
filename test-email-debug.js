const axios = require('axios');

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LWFkbWluLXVpZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDg3MDczOH0.1l1R7xhDuTAfb5HJCXM80p2EfZGcFmJwVLlNbfYKKQY';

async function testEmailDebug() {
    try {
        console.log('🧪 Testing email debug...\n');

        // Step 1: Create a contact message
        console.log('1. Creating contact message...');
        const contactResponse = await axios.post(`${API_BASE_URL}/api/contact`, {
            firstName: 'Debug',
            lastName: 'Test',
            email: 'sansilunikethma@gmail.com',
            subject: 'Email Debug Test',
            message: 'This is a test to debug email configuration'
        });

        console.log('✅ Contact response:', contactResponse.data);
        const messageId = contactResponse.data.data?.id;
        
        if (!messageId) {
            console.log('❌ No message ID returned');
            return;
        }

        console.log(`✅ Message created with ID: ${messageId}\n`);

        // Step 2: Send reply to trigger email debug logs
        console.log('2. Sending reply to trigger email debug...');
        const replyResponse = await axios.patch(`${API_BASE_URL}/api/admin/contact/messages/${messageId}/reply`, {
            replyMessage: 'Debug test reply - checking email configuration'
        }, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Reply response:', replyResponse.data);
        console.log('\n📋 Check Firebase Functions logs for email debug information:');
        console.log('Command: firebase functions:log --only api');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error(`Status: ${error.response.status}`);
        }
    }
}

testEmailDebug();
