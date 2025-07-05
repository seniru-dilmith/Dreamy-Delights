const axios = require("axios");

async function testContactFormPopup() {
  console.log("🧪 Testing contact form submission for popup...");

  const baseURL = "https://api-cvfhs7orea-uc.a.run.app";

  try {
    const contactData = {
      firstName: "Popup",
      lastName: "Test",
      email: "test@example.com",
      phone: "0711234567",
      subject: "Testing New Success Popup",
      message: "This is a test message to verify that the new success popup appears after form submission. The popup should show a polite message thanking the user."
    };

    console.log("📧 Submitting contact message...");
    const response = await axios.post(`${baseURL}/api/contact`, contactData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Contact response:", {
      success: response.data.success,
      message: response.data.message,
      messageId: response.data.data?.id
    });

    if (response.data.success) {
      console.log("🎉 SUCCESS! Contact form submission worked!");
      console.log("📱 Now test the frontend at: http://localhost:3000/contact");
      console.log("👀 Expected: After form submission, you should see:");
      console.log("   1. A toast notification with enhanced message");
      console.log("   2. A popup dialog with a polite thank you message");
      console.log("   3. Form fields should be cleared");
    } else {
      console.log("❌ Contact form submission failed");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testContactFormPopup();
