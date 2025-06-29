const admin = require("firebase-admin");

/**
 * Product Model - Handles all product-related database operations
 */
class ProductModel {
  /**
   * Initialize the Product Model
   */
  constructor() {
    // Lazy-load Firestore to avoid initialization issues
    this._db = null;
    this._collection = null;
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
   * Get products collection
   * @return {Object} Firestore collection
   */
  get collection() {
    if (!this._collection) {
      this._collection = this.db.collection("products");
    }
    return this._collection;
  }

  /**
   * Get featured products collection
   * @return {Object} Firestore collection
   */
  get featuredCollection() {
    return this.db.collection("featured_products");
  }

  /**
   * Get all products with optional filtering
   * @param {Object} options - Query options
   * @return {Promise<Array>} Array of products
   */
  async getAll(options = {}) {
    try {
      const {limit = 50, category} = options;
      let query = this.collection.limit(limit);

      if (category) {
        query = query.where("category", "==", category);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Get featured products
   * @return {Promise<Array>} Array of featured products
   */
  async getFeatured() {
    try {
      const snapshot = await this.featuredCollection.get();
      const featuredIds = snapshot.docs.map((doc) => doc.id);

      if (featuredIds.length === 0) {
        return [];
      }

      // Get the actual product data for featured products
      const productPromises = featuredIds.map((id) =>
        this.collection.doc(id).get());
      const productDocs = await Promise.all(productPromises);

      return productDocs
          .filter((doc) => doc.exists)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   * @param {string} id - Product ID
   * @return {Promise<Object|null>} Product data or null if not found
   */
  async getById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @return {Promise<string>} Created product ID
   */
  async create(productData) {
    try {
      const docRef = await this.collection.add({
        ...productData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {Object} productData - Updated product data
   * @return {Promise<void>}
   */
  async update(id, productData) {
    try {
      await this.collection.doc(id).update({
        ...productData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  /**
   * Add a product to featured collection
   * @param {string} productId - Product ID
   * @return {Promise<void>}
   */
  async addToFeatured(productId) {
    try {
      await this.featuredCollection.doc(productId).set({
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding product to featured:", error);
      throw error;
    }
  }

  /**
   * Remove a product from featured collection
   * @param {string} productId - Product ID
   * @return {Promise<void>}
   */
  async removeFromFeatured(productId) {
    try {
      await this.featuredCollection.doc(productId).delete();
    } catch (error) {
      console.error("Error removing product from featured:", error);
      throw error;
    }
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @return {Promise<void>}
   */
  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      await this.featuredCollection.doc(id).delete();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
}

module.exports = ProductModel;
