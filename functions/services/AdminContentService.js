const admin = require("firebase-admin");

/**
 * Admin Content Service - Handles content and settings management
 */
class AdminContentService {
  /**
   * Constructor for AdminContentService
   */
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Get website content/settings
   * @return {Object} Content data
   */
  async getContent() {
    try {
      const snapshot = await this.db.collection("content").get();

      const content = {};
      snapshot.forEach((doc) => {
        content[doc.id] = doc.data();
      });

      return content;
    } catch (error) {
      console.error("Error fetching content:", error);
      throw new Error("Failed to fetch content");
    }
  }

  /**
   * Update website content/settings
   * @param {string} section - Content section
   * @param {Object} contentData - Content data
   * @param {string} adminId - Admin ID
   * @return {boolean} Success status
   */
  async updateContent(section, contentData, adminId) {
    try {
      await this.db.collection("content").doc(section).set({
        ...contentData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: adminId,
      }, {merge: true});

      return true;
    } catch (error) {
      console.error("Error updating content:", error);
      throw new Error("Failed to update content");
    }
  }

  /**
   * Get admin settings
   * @return {Object} Settings data
   */
  async getSettings() {
    try {
      const snapshot = await this.db.collection("adminSettings").get();

      const settings = {};
      snapshot.forEach((doc) => {
        settings[doc.id] = doc.data();
      });

      return settings;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw new Error("Failed to fetch settings");
    }
  }

  /**
   * Update admin settings
   * @param {string} key - Setting key
   * @param {Object} settingData - Setting data
   * @param {string} adminId - Admin ID
   * @return {boolean} Success status
   */
  async updateSetting(key, settingData, adminId) {
    try {
      await this.db.collection("adminSettings").doc(key).set({
        ...settingData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: adminId,
      }, {merge: true});

      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw new Error("Failed to update settings");
    }
  }

  /**
   * Get contact messages
   * @param {Object} options - Query options
   * @return {Array} Contact messages
   */
  async getContactMessages(options = {}) {
    try {
      const ContactMessageModel = require("../models/ContactMessage");
      const contactMessageModel = new ContactMessageModel();

      const messages = await contactMessageModel.getAll(options);
      return messages;
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      throw new Error("Failed to fetch contact messages");
    }
  }

  /**
   * Get contact message statistics
   * @return {Object} Statistics
   */
  async getContactMessageStats() {
    try {
      const ContactMessageModel = require("../models/ContactMessage");
      const contactMessageModel = new ContactMessageModel();

      const stats = await contactMessageModel.getStats();
      return stats;
    } catch (error) {
      console.error("Error fetching contact message stats:", error);
      throw new Error("Failed to fetch contact message statistics");
    }
  }

  /**
   * Get contact message by ID
   * @param {string} messageId - Message ID
   * @return {Object} Contact message
   */
  async getContactMessage(messageId) {
    try {
      const ContactMessageModel = require("../models/ContactMessage");
      const contactMessageModel = new ContactMessageModel();

      const message = await contactMessageModel.getById(messageId);
      if (!message) {
        throw new Error("Contact message not found");
      }

      return message;
    } catch (error) {
      console.error("Error fetching contact message:", error);
      throw error;
    }
  }

  /**
   * Mark contact message as read
   * @param {string} messageId - Message ID
   * @param {string} adminId - Admin ID
   * @return {Object} Updated message
   */
  async markMessageAsRead(messageId, adminId) {
    try {
      const ContactMessageModel = require("../models/ContactMessage");
      const contactMessageModel = new ContactMessageModel();

      const updatedMessage = await contactMessageModel.markAsRead(
          messageId,
          adminId,
      );

      return updatedMessage;
    } catch (error) {
      console.error("Error marking contact message as read:", error);
      throw error;
    }
  }

  /**
   * Mark contact message as replied and send email
   * @param {string} messageId - Message ID
   * @param {string} adminId - Admin ID
   * @param {string} replyText - Reply text
   * @param {string} adminUsername - Admin username
   * @return {Object} Result with email status
   */
  async replyToMessage(messageId, adminId, replyText, adminUsername) {
    try {
      const ContactMessageModel = require("../models/ContactMessage");
      const EmailService = require("../services/EmailService");
      const contactMessageModel = new ContactMessageModel();

      // Reply text is optional - can be empty for just marking as replied
      const finalReplyText = replyText && replyText.trim() ?
        replyText.trim() : null;

      // Get the original message first
      const originalMessage = await contactMessageModel.getById(messageId);
      if (!originalMessage) {
        throw new Error("Contact message not found");
      }

      // Mark as replied in database
      const updatedMessage = await contactMessageModel.markAsReplied(
          messageId,
          adminId,
          finalReplyText,
      );

      let emailSent = false;
      let emailError = null;

      // Try to send email reply (only if there's actual reply text)
      try {
        // Initialize EmailService before checking availability
        await EmailService.initialize();

        if (EmailService.isAvailable() && finalReplyText) {
          // Construct customer name from firstName and lastName
          const firstName = originalMessage.firstName || "";
          const lastName = originalMessage.lastName || "";
          const customerName = `${firstName} ${lastName}`.trim() ||
                              originalMessage.name ||
                              "Customer";

          await EmailService.sendContactReply({
            to: originalMessage.email,
            customerName: customerName,
            originalSubject: originalMessage.subject,
            replyMessage: finalReplyText,
            adminName: adminUsername || "Dreamy Delights Team",
          });
          emailSent = true;
        } else if (!finalReplyText) {
          console.log(
              "📝 No reply text - message marked as replied without email",
          );
        } else {
          console.warn(
              "📧 Email service not available - reply saved but not sent",
          );
          emailError = "Email service not configured";
        }
      } catch (error) {
        console.error("❌ Failed to send reply email:", error);
        emailError = error.message;
      }

      return {
        updatedMessage,
        emailSent,
        emailError,
      };
    } catch (error) {
      console.error("Error replying to contact message:", error);
      throw error;
    }
  }

  /**
   * Update contact message
   * @param {string} messageId - Message ID
   * @param {Object} updateData - Update data
   * @return {Object} Updated message
   */
  async updateContactMessage(messageId, updateData) {
    try {
      const ContactMessageModel = require("../models/ContactMessage");
      const contactMessageModel = new ContactMessageModel();

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.createdAt;
      delete updateData.ipAddress;
      delete updateData.userAgent;

      const updatedMessage = await contactMessageModel.update(
          messageId,
          updateData,
      );

      return updatedMessage;
    } catch (error) {
      console.error("Error updating contact message:", error);
      throw error;
    }
  }

  /**
   * Delete contact message
   * @param {string} messageId - Message ID
   * @return {boolean} Success status
   */
  async deleteContactMessage(messageId) {
    try {
      const ContactMessageModel = require("../models/ContactMessage");
      const contactMessageModel = new ContactMessageModel();

      await contactMessageModel.delete(messageId);
      return true;
    } catch (error) {
      console.error("Error deleting contact message:", error);
      throw error;
    }
  }
}

module.exports = AdminContentService;
