const express = require("express");
const AdminAuthController = require("../../controllers/AdminAuthController");

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Admin login endpoint
 */
router.post("/login", (req, res) => {
  const authController = new AdminAuthController();
  authController.login(req, res);
});

module.exports = router;
