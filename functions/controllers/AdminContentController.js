const AdminContentService = require("../services/AdminContentService");

/**
 * Admin Content Controller - Handles content and contact message requests
 */
class AdminContentController {
  /**
   * Constructor for AdminContentController
   */
  constructor() {
    this.contentService = new AdminContentService();
  }

  /**
   * Get website content/settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getContent(req, res) {
    try {
      const content = await this.contentService.getContent();

      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch content",
      });
    }
  }

  /**
   * Update website content/settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateContent(req, res) {
    try {
      const {section} = req.params;
      const contentData = req.body;

      await this.contentService.updateContent(
          section,
          contentData,
          req.admin.id,
      );

      res.json({
        success: true,
        message: "Content updated successfully",
      });
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update content",
      });
    }
  }

  /**
   * Get admin settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSettings(req, res) {
    try {
      const settings = await this.contentService.getSettings();

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch settings",
      });
    }
  }

  /**
   * Update admin settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSetting(req, res) {
    try {
      const {key} = req.params;
      const settingData = req.body;

      await this.contentService.updateSetting(
          key,
          settingData,
          req.admin.id,
      );

      res.json({
        success: true,
        message: "Settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update settings",
      });
    }
  }

  /**
   * Get all contact messages
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getContactMessages(req, res) {
    try {
      const {status, limit} = req.query;
      const options = {};

      if (status && ["unread", "read", "replied"].includes(status)) {
        options.status = status;
      }

      if (limit && !isNaN(parseInt(limit))) {
        options.limit = parseInt(limit);
      }

      const messages = await this.contentService.getContactMessages(options);

      res.json({
        success: true,
        data: messages,
        count: messages.length,
      });
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch contact messages",
      });
    }
  }

  /**
   * Get contact message statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getContactMessageStats(req, res) {
    try {
      const stats = await this.contentService.getContactMessageStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching contact message stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch contact message statistics",
      });
    }
  }

  /**
   * Get a specific contact message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getContactMessage(req, res) {
    try {
      const {id} = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Contact message ID is required",
        });
      }

      const message = await this.contentService.getContactMessage(id);

      res.json({
        success: true,
        data: message,
      });
    } catch (error) {
      console.error("Error fetching contact message:", error);

      if (error.message === "Contact message not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch contact message",
      });
    }
  }

  /**
   * Mark contact message as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markMessageAsRead(req, res) {
    try {
      const {id} = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Contact message ID is required",
        });
      }

      const updatedMessage = await this.contentService.markMessageAsRead(
          id,
          req.admin.id,
      );

      res.json({
        success: true,
        message: "Contact message marked as read",
        data: updatedMessage,
      });
    } catch (error) {
      console.error("Error marking contact message as read:", error);

      if (error.message === "Contact message not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to mark contact message as read",
      });
    }
  }

  /**
   * Reply to contact message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async replyToMessage(req, res) {
    try {
      console.log("🔍 Reply endpoint called with:", {
        id: req.params.id,
        body: req.body,
        adminId: req.admin ? req.admin.id : null,
      });

      const {id} = req.params;
      const {replyText} = req.body;

      if (!id) {
        console.log("❌ Missing ID");
        return res.status(400).json({
          success: false,
          message: "Contact message ID is required",
        });
      }

      const result = await this.contentService.replyToMessage(
          id,
          req.admin.id,
          replyText,
          req.admin.username,
      );

      const successMessage = result.emailSent ?
        "Reply sent successfully and email delivered" :
        "Reply saved successfully" +
        (result.emailError ? ` (Email not sent: ${result.emailError})` : "");

      res.json({
        success: true,
        message: successMessage,
        data: result.updatedMessage,
        emailSent: result.emailSent,
        emailError: result.emailError,
      });
    } catch (error) {
      console.error("Error replying to contact message:", error);

      if (error.message === "Contact message not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to mark contact message as replied",
      });
    }
  }

  /**
   * Update contact message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateContactMessage(req, res) {
    try {
      const {id} = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Contact message ID is required",
        });
      }

      const updatedMessage = await this.contentService.updateContactMessage(
          id,
          updateData,
      );

      res.json({
        success: true,
        message: "Contact message updated successfully",
        data: updatedMessage,
      });
    } catch (error) {
      console.error("Error updating contact message:", error);

      if (error.message === "Contact message not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to update contact message",
      });
    }
  }

  /**
   * Delete contact message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteContactMessage(req, res) {
    try {
      const {id} = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Contact message ID is required",
        });
      }

      await this.contentService.deleteContactMessage(id);

      res.json({
        success: true,
        message: "Contact message deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting contact message:", error);

      if (error.message === "Contact message not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete contact message",
      });
    }
  }
}

module.exports = AdminContentController;
