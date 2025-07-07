const express = require("express");
const {requirePermission} = require("../../middleware/adminAuth");
const AdminUserController = require("../../controllers/AdminUserController");

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Get all users
 */
router.get("/",
    // requirePermission("manage_users"),
    (req, res) => {
      const userController = new AdminUserController();
      userController.getUsers(req, res);
    });

/**
 * Update user status (enable/disable user)
 */
router.patch("/:userId/status",
    requirePermission("manage_users"),
    (req, res) => {
      const userController = new AdminUserController();
      userController.updateUserStatus(req, res);
    });

/**
 * Update user role
 */
router.patch("/:userId/role",
    requirePermission("manage_users"),
    (req, res) => {
      const userController = new AdminUserController();
      userController.updateUserRole(req, res);
    });

module.exports = router;
