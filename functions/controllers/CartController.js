const CartService = require("../services/CartService");

/**
 * Cart Controller - Handles HTTP requests for cart operations
 */
class CartController {
  /**
   * Initialize Cart Controller with Cart Service
   */
  constructor() {
    this.cartService = new CartService();
  }

  /**
   * Get user's cart (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCart(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware
      const cart = await this.cartService.getCart(userId);
      res.json({
        success: true,
        cart,
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch cart",
      });
    }
  }

  /**
   * Add item to cart (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addItem(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware
      const {item} = req.body;

      // Validate item data
      if (!item || !item.id || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({
          success: false,
          error: "Invalid item data. Required: id, name, price, quantity",
        });
      }

      const cart = await this.cartService.addItem(userId, item);
      res.json({
        success: true,
        message: "Item added to cart",
        cart,
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add item to cart",
      });
    }
  }

  /**
   * Update item quantity in cart (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateItem(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware
      const {itemId} = req.params;
      const {quantity} = req.body;

      if (quantity === undefined || quantity < 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid quantity. Must be a non-negative number",
        });
      }

      const cart = await this.cartService.updateItemQuantity(
          userId, itemId, quantity);
      res.json({
        success: true,
        message: "Item updated in cart",
        cart,
      });
    } catch (error) {
      console.error("Error updating item in cart:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update item in cart",
      });
    }
  }

  /**
   * Remove item from cart (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeItem(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware
      const {itemId} = req.params;

      const cart = await this.cartService.removeItem(userId, itemId);
      res.json({
        success: true,
        message: "Item removed from cart",
        cart,
      });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove item from cart",
      });
    }
  }

  /**
   * Clear entire cart (requires authentication)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async clearCart(req, res) {
    try {
      const userId = req.user.uid; // Set by auth middleware

      const cart = await this.cartService.clearCart(userId);
      res.json({
        success: true,
        message: "Cart cleared",
        cart,
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({
        success: false,
        error: "Failed to clear cart",
      });
    }
  }
}

module.exports = CartController;
