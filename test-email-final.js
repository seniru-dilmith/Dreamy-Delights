const axios = require('axios');

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app';

// Admin JWT token (replace with actual token if needed)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LWFkbWluLXVpZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDg3MDczOH0.1l1R7xhDuTAfb5HJCXM80p2EfZGcFmJwVLlNbfYKKQY';

async function testCompleteEmailFlow() {
    try {
        console.log('🧪 Testing complete email flow...\n');

        // Step 1: Create a contact message
        console.log('1. Creating contact message...');
        const contactResponse = await axios.post(`${API_BASE_URL}/api/contact`, {
            name: 'Test User',
            firstName: 'Test',
            lastName: 'User',
            email: 'sansilunikethma@gmail.com', // Using your email to receive the reply
            subject: 'Final Email Test',
            message: 'This is a final test of the email reply system. Please reply to confirm it works!'
        });

        const messageId = contactResponse.data.id;
        console.log(`✅ Contact message created with ID: ${messageId}\n`);

        // Step 2: Get all messages to verify it was created
        console.log('2. Fetching all messages...');
        const messagesResponse = await axios.get(`${API_BASE_URL}/api/admin/contact/messages`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const message = messagesResponse.data.find(m => m.id === messageId);
        if (message) {
            console.log(`✅ Message found: "${message.subject}" from ${message.email}\n`);
        } else {
            console.log('❌ Message not found in admin view\n');
            return;
        }

        // Step 3: Send reply email
        console.log('3. Sending reply email...');
        const replyResponse = await axios.patch(`${API_BASE_URL}/api/admin/contact/messages/${messageId}/reply`, {
            replyMessage: 'Thank you for your message! This is an automated test reply to confirm our email system is working correctly. 🎉'
        }, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Reply API response:', replyResponse.data);

        // Step 4: Verify the message was marked as replied
        console.log('\n4. Verifying message status...');
        const updatedMessageResponse = await axios.get(`${API_BASE_URL}/api/admin/contact/messages/${messageId}`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            }
        });

        const updatedMessage = updatedMessageResponse.data;
        console.log(`✅ Message status - Replied: ${updatedMessage.replied}, Reply sent at: ${updatedMessage.repliedAt}\n`);

        console.log('🎉 Test completed successfully!');
        console.log('📧 Check your email inbox for the reply message.');
        console.log('💡 If you don\'t receive the email, check the Firebase Functions logs for any errors.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error(`Status: ${error.response.status}`);
        }
    }
}

testCompleteEmailFlow();
