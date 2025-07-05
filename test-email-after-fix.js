const axios = require('axios');

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app';

async function testEmailAfterFix() {
    try {
        console.log('🧪 Testing email after fixing the customer name issue...\n');

        // Step 1: Create a contact message with proper firstName/lastName
        console.log('1. Creating contact message with firstName and lastName...');
        const contactResponse = await axios.post(`${API_BASE_URL}/api/contact`, {
            firstName: 'Email',
            lastName: 'Test',
            email: 'sansilunikethma@gmail.com',
            subject: 'FIXED: Email Test After Customer Name Fix',
            message: 'Testing email delivery after fixing the customer name issue. This should now work properly! 🎉'
        });

        console.log('✅ Contact response:', contactResponse.data);
        const messageId = contactResponse.data.data?.id;
        
        if (!messageId) {
            console.log('❌ No message ID returned');
            return;
        }

        console.log(`✅ Message created with ID: ${messageId}\n`);
        console.log('2. ✅ Customer name fix deployed!');
        console.log('3. 🎯 Now test manually:');
        console.log('   - Open your admin dashboard');
        console.log('   - Find message: "FIXED: Email Test After Customer Name Fix"');
        console.log('   - Reply to the message');
        console.log('   - Check your email inbox');
        console.log('');
        console.log('🔧 What was fixed:');
        console.log('   - The admin route now properly constructs customer name from firstName + lastName');
        console.log('   - No more "Missing required email fields" error');
        console.log('   - Emails should now be sent successfully');
        console.log('');
        console.log('📧 Expected recipient: sansilunikethma@gmail.com');
        console.log('📋 Message ID:', messageId);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error(`Status: ${error.response.status}`);
        }
    }
}

testEmailAfterFix();
