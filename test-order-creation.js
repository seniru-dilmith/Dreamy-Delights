// Test the order creation API with sample data
async function testOrderCreation() {
  console.log('Testing order creation API...');
  
  const sampleOrderData = {
    items: [
      {
        productId: "test-product",
        name: "Test Cake",
        price: 2500,
        quantity: 1,
        customizations: []
      }
    ],
    totalAmount: 3000,
    shippingAddress: {
      name: "Test User",
      address: "123 Test Street",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      phone: "+1234567890"
    },
    contactPhone: "+1234567890",
    additionalNotes: "Test order",
    customerInfo: {
      email: "test@example.com",
      name: "Test User"
    }
  };

  try {
    const response = await fetch('https://us-central1-dreamy-delights-882ff.cloudfunctions.net/api/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real scenario, you'd need a valid auth token
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(sampleOrderData)
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Note: This test will fail auth validation, but will help verify endpoint structure
testOrderCreation();
