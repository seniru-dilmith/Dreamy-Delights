const axios = require("axios");

async function testEmailServiceFix() {
  console.log("🧪 Testing EmailService initialization fix...");

  const baseURL = "https://api-cvfhs7orea-uc.a.run.app";
  const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3RhZG1pbi0xNzUxNzAyMDE0NjMyLTUzMzNjOCIsInVzZXJuYW1lIjoidGVzdGFkbWluIiwicm9sZSI6ImFkbWluIiwicGVybWlzc2lvbnMiOlsibWFuYWdlX3Byb2R1Y3RzIiwibWFuYWdlX29yZGVycyIsIm1hbmFnZV91c2VycyIsIm1hbmFnZV90ZXN0aW1vbmlhbHMiLCJtYW5hZ2VfY29udGVudCIsInZpZXdfYW5hbHl0aWNzIiwic3VwZXJfYWRtaW4iXSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzUxNzAyMDY2LCJleHAiOjE3NTE3ODg0NjZ9.PFXD0HKthIOGvPt6Zc33PlIjDLDK9JkHRitjKXD4wsg";

  try {
    // Get latest contact message
    const getResponse = await axios.get(`${baseURL}/api/admin/contact-messages`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!getResponse.data.success || getResponse.data.data.length === 0) {
      console.log("❌ No contact messages found");
      return;
    }

    const latestMessage = getResponse.data.data[0];
    console.log(`✅ Found message: ${latestMessage.id}`);
    console.log(`   Subject: ${latestMessage.subject}`);
    console.log(`   Email: ${latestMessage.email}`);

    // Reply to the message
    const replyText = `AUTO-REPLY (${new Date().toISOString()}): Thank you for your message! This is an automated test to verify our email service is working properly.`;

    console.log("📧 Sending reply...");
    const replyResponse = await axios.patch(
        `${baseURL}/api/admin/contact-messages/${latestMessage.id}/reply`,
        {
          replyText: replyText,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        },
    );

    console.log("✅ Reply response:", {
      success: replyResponse.data.success,
      emailSent: replyResponse.data.emailSent,
      emailError: replyResponse.data.emailError,
    });

    if (replyResponse.data.success && replyResponse.data.emailSent) {
      console.log("🎉 EMAIL SENT SUCCESSFULLY!");
      console.log("📬 Check the recipient's inbox:", latestMessage.email);
    } else {
      console.log("❌ Email was not sent");
      if (replyResponse.data.emailError) {
        console.log("🔍 Email error:", replyResponse.data.emailError);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testEmailServiceFix();
