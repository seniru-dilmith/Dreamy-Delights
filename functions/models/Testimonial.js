const admin = require("firebase-admin");

/**
 * Testimonial Model - Handles all testimonial-related database operations
 */
class TestimonialModel {
  /**
   * Initialize the Testimonial Model
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
   * Get testimonials collection
   * @return {Object} Firestore collection
   */
  get collection() {
    if (!this._collection) {
      this._collection = this.db.collection("testimonials");
    }
    return this._collection;
  }

  /**
   * Get all testimonials with optional filtering
   * @param {Object} options - Query options
   * @return {Promise<Array>} Array of testimonials
   */
  async getAll(options = {}) {
    try {
      let query = this.collection.orderBy("createdAt", "desc");

      // Apply limit if specified
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Apply featured filter if specified
      if (options.featured !== undefined) {
        query = query.where("featured", "==", options.featured);
      }

      const snapshot = await query.get();
      const testimonials = [];

      snapshot.forEach((doc) => {
        testimonials.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return testimonials;
    } catch (error) {
      console.error("Error getting testimonials:", error);
      throw error;
    }
  }

  /**
   * Get featured testimonials
   * @param {number} limit - Number of testimonials to return
   * @return {Promise<Array>} Array of featured testimonials
   */
  async getFeatured(limit = 3) {
    try {
      // First try to get testimonials marked as featured
      let query = this.collection
          .where("featured", "==", true)
          .orderBy("createdAt", "desc")
          .limit(limit);

      let snapshot = await query.get();

      // If no featured testimonials found, get the latest ones
      if (snapshot.empty) {
        query = this.collection
            .orderBy("createdAt", "desc")
            .limit(limit);
        snapshot = await query.get();
      }

      const testimonials = [];
      snapshot.forEach((doc) => {
        testimonials.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return testimonials;
    } catch (error) {
      console.error("Error getting featured testimonials:", error);
      throw error;
    }
  }

  /**
   * Get a single testimonial by ID
   * @param {string} id - Testimonial ID
   * @return {Promise<Object>} Testimonial object
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
      console.error("Error getting testimonial by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new testimonial
   * @param {Object} testimonialData - Testimonial data
   * @return {Promise<Object>} Created testimonial
   */
  async create(testimonialData) {
    try {
      const now = admin.firestore.FieldValue.serverTimestamp();
      const data = {
        ...testimonialData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(data);
      return {
        id: docRef.id,
        ...data,
      };
    } catch (error) {
      console.error("Error creating testimonial:", error);
      throw error;
    }
  }

  /**
   * Update a testimonial
   * @param {string} id - Testimonial ID
   * @param {Object} updateData - Data to update
   * @return {Promise<Object>} Updated testimonial
   */
  async update(id, updateData) {
    try {
      const data = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.collection.doc(id).update(data);
      return await this.getById(id);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      throw error;
    }
  }

  /**
   * Delete a testimonial
   * @param {string} id - Testimonial ID
   * @return {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      throw error;
    }
  }

  /**
   * Check if a testimonial exists
   * @param {string} id - Testimonial ID
   * @return {Promise<boolean>} Existence status
   */
  async exists(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error("Error checking testimonial existence:", error);
      throw error;
    }
  }

  /**
   * Get testimonials count
   * @param {Object} filters - Optional filters
   * @return {Promise<number>} Count of testimonials
   */
  async getCount(filters = {}) {
    try {
      let query = this.collection;

      if (filters.featured !== undefined) {
        query = query.where("featured", "==", filters.featured);
      }

      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      console.error("Error getting testimonials count:", error);
      throw error;
    }
  }

  /**
   * Validate testimonial data
   * @param {Object} data - Testimonial data to validate
   * @return {Object} Validation result
   */
  validateData(data) {
    const errors = [];

    if (!data.name || typeof data.name !== "string" ||
        data.name.trim() === "") {
      errors.push("Name is required and must be a non-empty string");
    }

    if (!data.text || typeof data.text !== "string" ||
        data.text.trim() === "") {
      errors.push("Text is required and must be a non-empty string");
    }

    if (!data.rating || typeof data.rating !== "number" ||
        data.rating < 1 || data.rating > 5) {
      errors.push("Rating is required and must be a number between 1 and 5");
    }

    if (data.featured !== undefined && typeof data.featured !== "boolean") {
      errors.push("Featured must be a boolean value");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = TestimonialModel;
