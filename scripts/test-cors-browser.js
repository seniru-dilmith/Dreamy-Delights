// Load environment variables
require('dotenv').config();

(async function() {
  try {
    console.log('🔍 Health check');
    const healthRes = await fetch(`${process.env.NEXT_FUNCTIONS_URL}/api/health`);
    console.log('Status:', healthRes.status);
    console.log('Body:', await healthRes.json());
  } catch (err) {
    console.error('Health check error:', err);
  }

  try {
    console.log('🔍 Admin products CORS check');
    const res = await fetch(`${process.env.NEXT_FUNCTIONS_URL}/api/admin/products`);
    console.log('Status:', res.status);
    console.log('Body:', await res.json());
  } catch (err) {
    console.error('Admin products error:', err);
  }
})();