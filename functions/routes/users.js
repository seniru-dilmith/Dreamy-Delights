const express = require("express");
const UserController = require("../controllers/UserController");
const {authenticateUserMiddleware} = require("../middleware/auth");

/**
 * User Routes - Express router for user-related endpoints
 */
// eslint-disable-next-line new-cap
const router = express.Router();
const userController = new UserController();

// User routes - require authentication
router.get("/profile", authenticateUserMiddleware, (req, res) =>
  userController.getProfile(req, res));
router.put("/profile", authenticateUserMiddleware, (req, res) =>
  userController.updateProfile(req, res));

module.exports = router;
