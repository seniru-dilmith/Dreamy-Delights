const ProductService = require("../services/ProductService");

/**
 * Product Controller - Handles HTTP requests for product operations
 */
class ProductController {
  /**
   * Initialize Product Controller with Product Service
   */
  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get all products with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProducts(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        category: req.query.category,
      };

      const result = await this.productService.getProducts(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch products",
      });
    }
  }

  /**
   * Create a new product (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProduct(req, res) {
    try {
      const {name, price, description, category, image} = req.body;

      const productData = {
        name,
        price: parseFloat(price),
        description,
        category,
        image,
      };

      const result = await this.productService.createProduct(productData);
      res.json({
        success: true,
        productId: result.id,
        message: "Product added successfully",
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create product",
      });
    }
  }

  /**
   * Update an existing product (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProduct(req, res) {
    try {
      const productId = req.params.id || req.query.id;
      if (!productId) {
        return res.status(400).json({
          success: false,
          error: "Product ID is required for updates",
        });
      }

      const {name, price, description, category, image} = req.body;

      const updateData = {
        name,
        price: parseFloat(price),
        description,
        category,
        image,
      };

      await this.productService.updateProduct(productId, updateData);
      res.json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update product",
      });
    }
  }

  /**
   * Delete a product (Admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProduct(req, res) {
    try {
      const productId = req.params.id || req.query.id;
      if (!productId) {
        return res.status(400).json({
          success: false,
          error: "Product ID is required for deletion",
        });
      }

      await this.productService.deleteProduct(productId);
      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete product",
      });
    }
  }
}

module.exports = ProductController;
