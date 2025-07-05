const admin = require("firebase-admin");

/**
 * Featured Product Model - Handles featured products operations
 * This manages the featured_products collection which contains
 * complete product data
 */
class FeaturedProductModel {
  /**
   * Initialize the Featured Product Model
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
   * Get featured products collection
   * @return {Object} Firestore collection
   */
  get collection() {
    if (!this._collection) {
      this._collection = this.db.collection("featured_products");
    }
    return this._collection;
  }

  /**
   * Get all featured products
   * @param {Object} options - Query options
   * @return {Promise<Array>} Array of featured products
   */
  async getAll(options = {}) {
    try {
      const {limit = 10} = options;

      console.log("FeaturedProductModel: Fetching all featured products");
      let query = this.collection.where("featured", "==", true);

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      console.log(`FeaturedProductModel: Found ${snapshot.size} 
        featured products`);

      const products = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`FeaturedProductModel: Processing ${doc.id}: ${data.name}`);
        products.push({
          id: doc.id,
          ...data,
        });
      });

      console.log(`FeaturedProductModel: 
        Returning ${products.length} products`);
      return products;
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  }

  /**
   * Get a featured product by ID
   * @param {string} id - Product ID
   * @return {Promise<Object|null>} Product data or null if not found
   */
  async getById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    } catch (error) {
      console.error("Error fetching featured product by ID:", error);
      throw error;
    }
  }

  /**
   * Add a product to featured collection
   * @param {Object} productData - Complete product data
   * @return {Promise<string>} Created product ID
   */
  async add(productData) {
    try {
      const data = {
        ...productData,
        featured: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await this.collection.add(data);
      return docRef.id;
    } catch (error) {
      console.error("Error adding featured product:", error);
      throw error;
    }
  }

  /**
   * Update a featured product
   * @param {string} id - Product ID
   * @param {Object} updateData - Data to update
   * @return {Promise<void>}
   */
  async update(id, updateData) {
    try {
      const data = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.collection.doc(id).update(data);
    } catch (error) {
      console.error("Error updating featured product:", error);
      throw error;
    }
  }

  /**
   * Remove a product from featured collection
   * @param {string} id - Product ID
   * @return {Promise<void>}
   */
  async remove(id) {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
      console.error("Error removing featured product:", error);
      throw error;
    }
  }

  /**
   * Check if a product is featured
   * @param {string} id - Product ID
   * @return {Promise<boolean>} True if product is featured
   */
  async isFeatured(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error("Error checking if product is featured:", error);
      return false;
    }
  }
}

module.exports = FeaturedProductModel;
