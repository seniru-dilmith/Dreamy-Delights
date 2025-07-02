const admin = require("firebase-admin");

/**
 * Cart Service - Handles cart operations in Firestore
 */
class CartService {
  /**
   * Initialize Cart Service with Firestore database
   */
  constructor() {
    // Lazy-load Firestore to avoid initialization issues
    this._db = null;
  }

  /**
   * Get Firestore database instance
   * @return {Object} Firestore database
   */
  get db() {
    if (!this._db) {
      this._db = admin.firestore();
    }
    return this._db;
  }

  /**
   * Get user's cart from database
   * @param {string} userId - User ID
   * @return {Promise<Object>} Cart data
   */
  async getCart(userId) {
    try {
      const cartDoc = await this.db.collection("carts").doc(userId).get();

      if (!cartDoc.exists) {
        return {
          items: [],
          total: 0,
          updatedAt: new Date().toISOString(),
        };
      }

      const cartData = cartDoc.data();
      return {
        items: cartData.items || [],
        total: this._calculateTotal(cartData.items || []),
        updatedAt: cartData.updatedAt,
      };
    } catch (error) {
      console.error("Error getting cart:", error);
      throw new Error("Failed to get cart");
    }
  }

  /**
   * Add item to user's cart
   * @param {string} userId - User ID
   * @param {Object} item - Item to add
   * @return {Promise<Object>} Updated cart data
   */
  async addItem(userId, item) {
    try {
      const cartRef = this.db.collection("carts").doc(userId);
      const cartDoc = await cartRef.get();

      let items = [];
      if (cartDoc.exists) {
        items = cartDoc.data().items || [];
      }

      // Check if item already exists
      const existingItemIndex = items.findIndex((i) => i.id === item.id);

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        items[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item
        items.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
          customizations: item.customizations || {},
        });
      }

      const total = this._calculateTotal(items);
      const updatedAt = new Date().toISOString();

      await cartRef.set({
        items,
        total,
        updatedAt,
        userId,
      });

      return {
        items,
        total,
        updatedAt,
      };
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw new Error("Failed to add item to cart");
    }
  }

  /**
   * Update item quantity in user's cart
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID to update
   * @param {number} quantity - New quantity
   * @return {Promise<Object>} Updated cart data
   */
  async updateItemQuantity(userId, itemId, quantity) {
    try {
      const cartRef = this.db.collection("carts").doc(userId);
      const cartDoc = await cartRef.get();

      if (!cartDoc.exists) {
        throw new Error("Cart not found");
      }

      let items = cartDoc.data().items || [];

      if (quantity === 0) {
        // Remove item if quantity is 0
        items = items.filter((item) => item.id !== itemId);
      } else {
        // Update quantity
        const itemIndex = items.findIndex((item) => item.id === itemId);
        if (itemIndex >= 0) {
          items[itemIndex].quantity = quantity;
        } else {
          throw new Error("Item not found in cart");
        }
      }

      const total = this._calculateTotal(items);
      const updatedAt = new Date().toISOString();

      await cartRef.set({
        items,
        total,
        updatedAt,
        userId,
      });

      return {
        items,
        total,
        updatedAt,
      };
    } catch (error) {
      console.error("Error updating item quantity:", error);
      throw new Error("Failed to update item quantity");
    }
  }

  /**
   * Remove item from user's cart
   * @param {string} userId - User ID
   * @param {string} itemId - Item ID to remove
   * @return {Promise<Object>} Updated cart data
   */
  async removeItem(userId, itemId) {
    try {
      const cartRef = this.db.collection("carts").doc(userId);
      const cartDoc = await cartRef.get();

      if (!cartDoc.exists) {
        throw new Error("Cart not found");
      }

      const items = cartDoc.data().items || [];
      const filteredItems = items.filter((item) => item.id !== itemId);

      const total = this._calculateTotal(filteredItems);
      const updatedAt = new Date().toISOString();

      await cartRef.set({
        items: filteredItems,
        total,
        updatedAt,
        userId,
      });

      return {
        items: filteredItems,
        total,
        updatedAt,
      };
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw new Error("Failed to remove item from cart");
    }
  }

  /**
   * Clear user's entire cart
   * @param {string} userId - User ID
   * @return {Promise<Object>} Empty cart data
   */
  async clearCart(userId) {
    try {
      const cartRef = this.db.collection("carts").doc(userId);
      const updatedAt = new Date().toISOString();

      await cartRef.set({
        items: [],
        total: 0,
        updatedAt,
        userId,
      });

      return {
        items: [],
        total: 0,
        updatedAt,
      };
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new Error("Failed to clear cart");
    }
  }

  /**
   * Calculate total price of cart items
   * @param {Array} items - Cart items
   * @return {number} Total price
   * @private
   */
  _calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}

module.exports = CartService;
