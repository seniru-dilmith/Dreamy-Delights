const ProductModel = require("../models/Product");

/**
 * Product Service - Business logic for product operations
 */
class ProductService {
  /**
   * Initialize the Product Service
   */
  constructor() {
    this.productModel = new ProductModel();
  }

  /**
   * Get all products with pagination and filtering
   * @param {Object} options - Query options
   * @return {Promise<Object>} Products data with metadata
   */
  async getProducts(options = {}) {
    const {page = 1, limit = 10, category} = options;
    const products = await this.productModel.getAll({limit, category});

    return {
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        count: products.length,
      },
    };
  }

  /**
   * Get featured products
   * @return {Promise<Object>} Featured products data
   */
  async getFeaturedProducts() {
    const products = await this.productModel.getFeatured();

    return {
      success: true,
      data: products,
      count: products.length,
    };
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @return {Promise<Object>} Creation result
   */
  async createProduct(productData) {
    // Validate required fields
    const {name, price, description, category} = productData;
    if (!name || !price || !description || !category) {
      throw new Error(
          "Missing required fields: name, price, description, category",
      );
    }

    const productId = await this.productModel.create(productData);

    return {
      success: true,
      productId,
      message: "Product added successfully",
    };
  }

  /**
   * Update an existing product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @return {Promise<Object>} Update result
   */
  async updateProduct(productId, productData) {
    if (!productId) {
      throw new Error("Product ID is required for updates");
    }

    await this.productModel.update(productId, productData);

    return {
      success: true,
      message: "Product updated successfully",
    };
  }

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @return {Promise<Object>} Deletion result
   */
  async deleteProduct(productId) {
    if (!productId) {
      throw new Error("Product ID is required for deletion");
    }

    await this.productModel.delete(productId);

    return {
      success: true,
      message: "Product deleted successfully",
    };
  }
}

module.exports = ProductService;
