const express = require("express");
const CartController = require("../controllers/CartController");
const {authenticateUserMiddleware} = require("../middleware/auth");

/**
 * Cart Routes - Express router for cart-related endpoints
 */
// eslint-disable-next-line new-cap
const router = express.Router();
const cartController = new CartController();

// Cart routes - require authentication
router.get("/", authenticateUserMiddleware, (req, res) =>
  cartController.getCart(req, res));
router.post("/items", authenticateUserMiddleware, (req, res) =>
  cartController.addItem(req, res));
router.put("/items/:itemId", authenticateUserMiddleware, (req, res) =>
  cartController.updateItem(req, res));
router.delete("/items/:itemId", authenticateUserMiddleware, (req, res) =>
  cartController.removeItem(req, res));
router.delete("/", authenticateUserMiddleware, (req, res) =>
  cartController.clearCart(req, res));

module.exports = router;
