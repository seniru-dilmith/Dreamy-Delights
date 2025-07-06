const express = require("express");
const {
  requirePermission,
  requireAnyPermission,
} = require("../../middleware/adminAuth");
const AdminContentController =
  require("../../controllers/AdminContentController");

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Get all contact messages
 */
router.get("/",
    requireAnyPermission(["manage_content", "view_analytics"]),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.getContactMessages(req, res);
    });

/**
 * Get contact message statistics
 */
router.get("/stats",
    requireAnyPermission(["manage_content", "view_analytics"]),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.getContactMessageStats(req, res);
    });

/**
 * Get a specific contact message
 */
router.get("/:id",
    requireAnyPermission(["manage_content", "view_analytics"]),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.getContactMessage(req, res);
    });

/**
 * Mark contact message as read
 */
router.patch("/:id/read",
    requirePermission("manage_content"),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.markMessageAsRead(req, res);
    });

/**
 * Mark contact message as replied and send email
 */
router.patch("/:id/reply",
    requirePermission("manage_content"),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.replyToMessage(req, res);
    });

/**
 * Update contact message
 */
router.patch("/:id",
    requirePermission("manage_content"),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.updateContactMessage(req, res);
    });

/**
 * Delete contact message
 */
router.delete("/:id",
    requirePermission("manage_content"),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.deleteContactMessage(req, res);
    });

module.exports = router;
