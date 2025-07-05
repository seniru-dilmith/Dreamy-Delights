const axios = require('axios');

const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app';

async function testApiHealth() {
    try {
        console.log('Testing API health...');
        const response = await axios.get(`${API_BASE_URL}/api/health`);
        console.log('✅ API Health Response:', response.data);
        
        // Test if contact route exists by making a simple GET
        console.log('Testing contact route...');
        try {
            const contactResponse = await axios.get(`${API_BASE_URL}/api/contact/messages`);
            console.log('✅ Contact route response:', contactResponse.status);
        } catch (error) {
            console.log('❌ Contact route error:', error.response?.status, error.response?.data);
        }
        
    } catch (error) {
        console.error('❌ API Health failed:', error.response?.data || error.message);
    }
}

testApiHealth();
