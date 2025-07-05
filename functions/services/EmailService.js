/* eslint-disable max-len */
const nodemailer = require("nodemailer");

/**
 * Email Service - Handles sending emails via SMTP
 */
class EmailService {
  /**
   * Create an EmailService instance
   */
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize the email transporter
   */
  async initialize() {
    if (this.initialized) return true;

    try {
      console.log("🔍 EmailService Debug - Using environment variables (Firebase Functions v2)...");

      // In Firebase Functions v2, we must use environment variables
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = process.env.SMTP_PORT || "587";

      console.log("🔍 Environment variables check:");
      console.log("  SMTP_USER:", smtpUser ? "***set***" : "undefined");
      console.log("  SMTP_PASS:", smtpPass ? "***set***" : "undefined");
      console.log("  SMTP_HOST:", smtpHost);
      console.log("  SMTP_PORT:", smtpPort);

      // Get email configuration from environment variables
      const emailConfig = {
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser, // Gmail address
          pass: smtpPass, // App password
        },
      };

      console.log("🔍 EmailService config (auth masked):", {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.auth.user ? "***set***" : "undefined",
          pass: emailConfig.auth.pass ? "***set***" : "undefined",
        },
      });

      // Validate email configuration
      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.warn("❌ Email service not configured. Missing SMTP credentials:");
        console.warn("  Missing user:", !emailConfig.auth.user);
        console.warn("  Missing pass:", !emailConfig.auth.pass);
        this.initialized = false;
        return false;
      }

      console.log("🔍 Creating nodemailer transporter...");
      this.transporter = nodemailer.createTransport(emailConfig);

      // Store config for later use
      this.smtpConfig = {
        user: smtpUser,
        adminEmail: process.env.ADMIN_EMAIL || smtpUser,
      };

      // Verify the connection
      console.log("🔍 Verifying SMTP connection...");
      await this.transporter.verify();
      console.log("✅ Email service initialized successfully");
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error.message);
      console.error("❌ Full error:", error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Send a reply email to a contact message
   * @param {Object} options - Email options
   * @return {Promise<boolean>} Success status
   */
  async sendContactReply(options) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult) {
          throw new Error("Email service not available");
        }
      }

      const {
        to,
        customerName,
        originalSubject,
        replyMessage,
        adminName = "Dreamy Delights Team",
      } = options;

      // Validate required fields
      if (!to || !customerName || !originalSubject) {
        throw new Error("Missing required email fields");
      }

      const emailSubject = `Re: ${originalSubject}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reply from Dreamy Delights</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .header p {
              margin: 5px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content {
              padding: 30px 20px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #374151;
            }
            .message-box {
              background: #f8fafc;
              border-left: 4px solid #ec4899;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            .footer {
              background: #f8fafc;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .contact-info {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .contact-info h3 {
              color: #374151;
              margin-bottom: 10px;
            }
            .contact-info p {
              margin: 5px 0;
              color: #6b7280;
            }
            .signature {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍰 Dreamy Delights</h1>
              <p>Your Sweet Dreams Come True</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hello ${customerName},
              </div>
              
              <p>Thank you for contacting us! We've received your message and wanted to get back to you.</p>
              
              ${replyMessage ? `
                <div class="message-box">
                  <strong>Our Response:</strong><br>
                  ${replyMessage.replace(/\n/g, "<br>")}
                </div>
              ` : ""}
              
              <p>We appreciate your interest in Dreamy Delights and look forward to serving you with our delicious treats!</p>
              
              <div class="contact-info">
                <h3>📞 Get in Touch</h3>
                <p><strong>Phone:</strong> (070) 630 9127</p>
                <p><strong>Email:</strong> sansilunikethma@gmail.com</p>
                <p><strong>Location:</strong> Horana, Sri Lanka</p>
                <p><strong>Hours:</strong> Mon-Fri: 7:00 AM-8:00 PM, Sat-Sun: 8:00 AM-9:00 PM</p>
              </div>
              
              <div class="signature">
                <p>Best regards,<br>
                <strong>${adminName}</strong><br>
                Dreamy Delights Team</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="color: #6b7280; margin: 0;">
                This email was sent in response to your contact form submission.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Hello ${customerName},

Thank you for contacting us! We've received your message and wanted to get back to you.

${replyMessage ? `Our Response:\n${replyMessage}\n\n` : ""}

We appreciate your interest in Dreamy Delights and look forward to serving you with our delicious treats!

Contact Information:
Phone: (070) 630 9127
Email: sansilunikethma@gmail.com
Location: Horana, Sri Lanka
Hours: Mon-Fri: 7:00 AM-8:00 PM, Sat-Sun: 8:00 AM-9:00 PM

Best regards,
${adminName}
Dreamy Delights Team

This email was sent in response to your contact form submission.
      `;

      const mailOptions = {
        from: {
          name: "Dreamy Delights",
          address: this.smtpConfig.user,
        },
        to: to,
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      throw error;
    }
  }

  /**
   * Send a notification email to admin about new contact message
   * @param {Object} options - Email options
   * @return {Promise<boolean>} Success status
   */
  async sendAdminNotification(options) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult) {
          console.warn("Email service not available for admin notification");
          return false;
        }
      }

      const {
        customerName,
        customerEmail,
        subject,
        message,
        phone,
        messageId,
      } = options;

      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (!adminEmail) {
        console.warn("No admin email configured for notifications");
        return false;
      }

      const emailSubject = `🔔 New Contact Message: ${subject}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ec4899; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .message-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🍰 New Contact Message</h2>
              <p>Dreamy Delights Admin Notification</p>
            </div>
            <div class="content">
              <div class="info-row">
                <span class="label">From:</span> ${customerName} (${customerEmail})
              </div>
              ${phone ? `<div class="info-row"><span class="label">Phone:</span> ${phone}</div>` : ""}
              <div class="info-row">
                <span class="label">Subject:</span> ${subject}
              </div>
              <div class="info-row">
                <span class="label">Message ID:</span> ${messageId}
              </div>
              <div class="message-box">
                <div class="label">Message:</div>
                <p>${message.replace(/\n/g, "<br>")}</p>
              </div>
              <p style="margin-top: 20px; color: #666;">
                Please log in to the admin dashboard to respond to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: {
          name: "Dreamy Delights System",
          address: process.env.SMTP_USER,
        },
        to: adminEmail,
        subject: emailSubject,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Admin notification sent:", result.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send admin notification:", error);
      return false;
    }
  }

  /**
   * Check if email service is available
   * @return {boolean} Availability status
   */
  isAvailable() {
    return this.initialized &&
           !!process.env.SMTP_USER &&
           !!process.env.SMTP_PASS &&
           !!this.transporter;
  }
}

// Export singleton instance
module.exports = new EmailService();
