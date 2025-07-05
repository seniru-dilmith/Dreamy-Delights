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
   * Get all products with optional filtering
   * @param {Object} options - Query options
   * @return {Promise<Array>} Array of products
   */
  async getAll(options = {}) {
    const {limit = 10, category, featured} = options;
    console.log("ProductModel.getAll called with:", options);

    let query = this.collection;

    if (category) {
      query = query.where("category", "==", category);
      console.log("Added category filter:", category);
    }

    if (featured !== undefined) {
      query = query.where("featured", "==", featured);
      console.log("Added featured filter:", featured);
    }

    console.log("Executing query with limit:", limit);
    const snapshot = await query.limit(limit).get();
    console.log("Query returned", snapshot.size, "documents");

    const products = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Product: ${data.name}, featured: ${data.featured}`);
      products.push({
        id: doc.id,
        ...data,
      });
    });

    console.log(`Returning ${products.length} products`);
    return products;
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @return {Promise<Object|null>} Product data or null
   */
  async getById(id) {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @return {Promise<Object>} Result with product ID
   */
  async create(productData) {
    const data = {
      ...productData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(data);
    return {id: docRef.id};
  }

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} updateData - Data to update
   * @return {Promise<void>}
   */
  async update(id, updateData) {
    const data = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await this.collection.doc(id).update(data);
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @return {Promise<void>}
   */
  async delete(id) {
    await this.collection.doc(id).delete();
  }
}

module.exports = ProductModel;
