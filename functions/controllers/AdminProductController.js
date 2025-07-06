const AdminProductService = require("../services/AdminProductService");

/**
 * Admin Product Controller - Handles product management requests
 */
class AdminProductController {
  /**
   * Constructor for AdminProductController
   */
  constructor() {
    this.productService = new AdminProductService();
  }

  /**
   * Get all products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProducts(req, res) {
    try {
      const products = await this.productService.getAllProducts();

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch products",
      });
    }
  }

  /**
   * Create new product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProduct(req, res) {
    try {
      console.log("Creating product - Request body:", req.body);
      console.log("Creating product - File info:", req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      } : "No file");

      let imageUrl = req.body.imageUrl || null;

      // Upload image if provided
      if (req.file) {
        console.log("Starting image upload...");
        imageUrl = await this.productService.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
        );
      }

      const productData = {
        ...req.body,
        imageUrl,
      };

      const product = await this.productService.createProduct(
          productData,
          req.admin.id,
      );

      res.json({
        success: true,
        data: product,
        message: "Product created successfully",
      });
    } catch (error) {
      console.error("Error creating product:", error);

      // More specific error messages
      let errorMessage = "Failed to create product";
      if (error.code === "permission-denied") {
        errorMessage = "Permission denied: Check Firebase Storage rules";
      } else if (error.code === "storage/unauthorized") {
        errorMessage = "Storage unauthorized: Check service account perms";
      } else if (error.code === "storage/bucket-not-found") {
        errorMessage = "Storage bucket not found";
      } else if (error.message) {
        errorMessage = `Failed to create product: ${error.message}`;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ?
          error.stack : undefined,
      });
    }
  }

  /**
   * Update product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProduct(req, res) {
    try {
      console.log("🔄 Updating product - Product ID:", req.params.id);
      console.log("🔄 Updating product - Request body:", req.body);
      console.log("🔄 Updating product - File info:", req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      } : "No file");

      const {id} = req.params;
      const updateData = {...req.body};

      // Handle image upload
      if (req.file) {
        updateData.imageUrl = await this.productService.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
        );
      }

      await this.productService.updateProduct(
          id,
          updateData,
          req.admin.id,
      );

      res.json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update product",
        error: process.env.NODE_ENV === "development" ?
          error.stack : undefined,
      });
    }
  }

  /**
   * Delete product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProduct(req, res) {
    try {
      const {id} = req.params;
      await this.productService.deleteProduct(id);

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete product",
      });
    }
  }

  /**
   * Toggle product featured status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleFeatured(req, res) {
    try {
      const {id} = req.params;
      const result = await this.productService.toggleFeatured(
          id,
          req.admin.id,
      );

      res.json({
        success: true,
        featured: result.featured,
        message: result.message,
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to toggle featured status",
      });
    }
  }
}

module.exports = AdminProductController;
