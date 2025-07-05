const express = require("express");
const ContactMessageModel = require("../models/ContactMessage");

// eslint-disable-next-line new-cap
const router = express.Router();

// Initialize ContactMessage model
const contactMessageModel = new ContactMessageModel();

/**
 * Create a new contact message (public endpoint)
 */
router.post("/", async (req, res) => {
  try {
    console.log("Creating contact message:", req.body);

    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, subject, " +
          "and message are required",
      });
    }

    // Get client IP address and user agent for tracking
    const ipAddress = req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const userAgent = req.get("User-Agent");

    const messageData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      subject: subject.trim(),
      message: message.trim(),
      ipAddress,
      userAgent,
    };

    const createdMessage = await contactMessageModel.create(messageData);

    console.log("Contact message created successfully:", createdMessage.id);

    // Try to send admin notification email (non-blocking)
    try {
      const EmailService = require("../services/EmailService");
      if (EmailService.isAvailable()) {
        // Send notification in background (don't await)
        EmailService.sendAdminNotification({
          customerName: `${firstName} ${lastName}`,
          customerEmail: email,
          subject,
          message,
          phone,
          messageId: createdMessage.id,
        }).catch((notificationError) => {
          console.error(
              "Failed to send admin notification:", notificationError,
          );
        });
      }
    } catch (error) {
      console.error("Error setting up admin notification:", error);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully! " +
        "We'll get back to you soon.",
      data: {
        id: createdMessage.id,
        status: createdMessage.status,
        createdAt: createdMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating contact message:", error);

    // Handle validation errors specifically
    if (error.message.includes("required") ||
        error.message.includes("Invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

module.exports = router;
