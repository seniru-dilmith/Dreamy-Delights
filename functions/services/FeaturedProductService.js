const FeaturedProductModel = require("../models/FeaturedProduct");

/**
 * Featured Product Service - Business logic for featured products
 */
class FeaturedProductService {
  /**
   * Initialize the Featured Product Service
   */
  constructor() {
    this.featuredProductModel = new FeaturedProductModel();
  }

  /**
   * Get all featured products
   * @param {Object} options - Query options
   * @return {Promise<Object>} Featured products data with metadata
   */
  async getFeaturedProducts(options = {}) {
    try {
      const {limit = 10} = options;
      const products = await this.featuredProductModel.getAll({limit});

      return {
        success: true,
        data: products,
        count: products.length,
        message: products.length > 0 ?
          `Found ${products.length} featured products` :
          "No featured products found",
      };
    } catch (error) {
      console.error("Error in getFeaturedProducts service:", error);
      throw new Error("Failed to fetch featured products");
    }
  }

  /**
   * Get a featured product by ID
   * @param {string} id - Product ID
   * @return {Promise<Object>} Product data
   */
  async getFeaturedProductById(id) {
    try {
      const product = await this.featuredProductModel.getById(id);

      if (!product) {
        return {
          success: false,
          error: "Featured product not found",
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error("Error in getFeaturedProductById service:", error);
      throw new Error("Failed to fetch featured product");
    }
  }

  /**
   * Add a product to featured collection
   * @param {Object} productData - Product data
   * @return {Promise<Object>} Creation result
   */
  async addFeaturedProduct(productData) {
    try {
      // Validate required fields
      const {name, price, description, category} = productData;
      if (!name || !price || !description || !category) {
        throw new Error(
            "Missing required fields: name, price, description, category",
        );
      }

      const productId = await this.featuredProductModel.add(productData);

      return {
        success: true,
        productId,
        message: "Product added to featured successfully",
      };
    } catch (error) {
      console.error("Error in addFeaturedProduct service:", error);
      throw error;
    }
  }

  /**
   * Update a featured product
   * @param {string} id - Product ID
   * @param {Object} updateData - Update data
   * @return {Promise<Object>} Update result
   */
  async updateFeaturedProduct(id, updateData) {
    try {
      // Check if product exists
      const exists = await this.featuredProductModel.isFeatured(id);
      if (!exists) {
        return {
          success: false,
          error: "Featured product not found",
        };
      }

      await this.featuredProductModel.update(id, updateData);

      return {
        success: true,
        message: "Featured product updated successfully",
      };
    } catch (error) {
      console.error("Error in updateFeaturedProduct service:", error);
      throw new Error("Failed to update featured product");
    }
  }

  /**
   * Remove a product from featured collection
   * @param {string} id - Product ID
   * @return {Promise<Object>} Deletion result
   */
  async removeFeaturedProduct(id) {
    try {
      // Check if product exists
      const exists = await this.featuredProductModel.isFeatured(id);
      if (!exists) {
        return {
          success: false,
          error: "Featured product not found",
        };
      }

      await this.featuredProductModel.remove(id);

      return {
        success: true,
        message: "Product removed from featured successfully",
      };
    } catch (error) {
      console.error("Error in removeFeaturedProduct service:", error);
      throw new Error("Failed to remove featured product");
    }
  }
}

module.exports = FeaturedProductService;
