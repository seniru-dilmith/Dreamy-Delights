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
      console.log("ProductController.createProduct - req.body:", req.body);

      const {
        name, price, description, category, image, imageUrl,
        featured, stock, active,
      } = req.body;

      // Build product data with defaults for optional fields
      const productData = {
        name,
        price: parseFloat(price),
        description,
        category,
        featured: Boolean(featured),
        stock: stock !== undefined ? parseInt(stock) : 0,
        active: active !== undefined ? Boolean(active) : true,
      };

      // Add image fields if provided
      if (image !== undefined) productData.image = image;
      if (imageUrl !== undefined) productData.imageUrl = imageUrl;

      console.log("ProductController.createProduct - productData:",
          productData);

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

      console.log("ProductController.updateProduct - productId:", productId);
      console.log("ProductController.updateProduct - req.body:", req.body);

      const {
        name, price, description, category, image, imageUrl,
        featured, stock, active,
      } = req.body;

      // Build update data, only including fields that are provided
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (image !== undefined) updateData.image = image;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (featured !== undefined) updateData.featured = Boolean(featured);
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (active !== undefined) updateData.active = Boolean(active);

      console.log("ProductController.updateProduct - updateData:", updateData);

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

  /**
   * Get featured products only
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFeaturedProducts(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        category: req.query.category,
        featured: true, // Only get featured products
      };

      const result = await this.productService.getProducts(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch featured products",
      });
    }
  }

  /**
   * Toggle featured status of a product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleFeaturedStatus(req, res) {
    try {
      const productId = req.params.id;
      if (!productId) {
        return res.status(400).json({
          success: false,
          error: "Product ID is required",
        });
      }

      const result = await this.productService.toggleFeaturedStatus(productId);
      res.json({
        success: true,
        featured: result.featured,
        message: result.featured ?
          "Product added to featured products" :
          "Product removed from featured products",
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to toggle featured status",
      });
    }
  }
}

module.exports = ProductController;
