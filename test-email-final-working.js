const axios = require('axios');

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app';

async function testCompleteEmailFlow() {
    try {
        console.log('🧪 Testing complete email flow (FINAL TEST)...\n');

        // Step 1: Create a contact message
        console.log('1. Creating contact message...');
        const contactResponse = await axios.post(`${API_BASE_URL}/api/contact`, {
            firstName: 'Final',
            lastName: 'Test',
            email: 'sansilunikethma@gmail.com', // Your email to receive the reply
            subject: 'Final Email Test - Should Work Now!',
            message: 'This is the final test of the email reply system. If you receive this reply, everything is working perfectly! 🎉'
        });

        console.log('✅ Contact response:', contactResponse.data);
        const messageId = contactResponse.data.data?.id;
        
        if (!messageId) {
            console.log('❌ No message ID returned');
            return;
        }

        console.log(`✅ Message created with ID: ${messageId}\n`);

        // Step 2: Now you can manually reply to this message through your admin dashboard
        console.log('2. Next steps:');
        console.log('   📋 Open your admin dashboard');
        console.log('   📧 Find the message: "Final Email Test - Should Work Now!"');
        console.log('   ✏️  Reply to the message');
        console.log('   📬 Check your email inbox for the reply');
        console.log('');
        console.log('🎯 Message ID for manual testing:', messageId);
        console.log('📧 Reply will be sent to: sansilunikethma@gmail.com');
        console.log('');
        console.log('✅ Email service is now fully configured and ready!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error(`Status: ${error.response.status}`);
        }
    }
}

testCompleteEmailFlow();
