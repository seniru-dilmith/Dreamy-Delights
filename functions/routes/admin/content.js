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
 * Get website content/settings
 */
router.get("/",
    requirePermission("manage_content"),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.getContent(req, res);
    });

/**
 * Update website content/settings
 */
router.put("/:section",
    requirePermission("manage_content"),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.updateContent(req, res);
    });

/**
 * Get admin settings
 */
router.get("/settings",
    requireAnyPermission(["manage_settings", "manage_admins"]),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.getSettings(req, res);
    });

/**
 * Update admin settings
 */
router.put("/settings/:key",
    requirePermission("manage_settings"),
    (req, res) => {
      const contentController = new AdminContentController();
      contentController.updateSetting(req, res);
    });

module.exports = router;
