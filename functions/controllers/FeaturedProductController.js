const FeaturedProductService = require("../services/FeaturedProductService");

/**
 * Featured Product Controller - Handles HTTP requests for featured products
 */
class FeaturedProductController {
  /**
   * Initialize Featured Product Controller
   */
  constructor() {
    this.featuredProductService = new FeaturedProductService();
  }

  /**
   * Get all featured products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFeaturedProducts(req, res) {
    try {
      const options = {
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await this.featuredProductService
          .getFeaturedProducts(options);
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
   * Get a featured product by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFeaturedProductById(req, res) {
    try {
      const {id} = req.params;
      const result = await this.featuredProductService
          .getFeaturedProductById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching featured product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch featured product",
      });
    }
  }

  /**
   * Add a product to featured collection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addFeaturedProduct(req, res) {
    try {
      const result = await this.featuredProductService
          .addFeaturedProduct(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding featured product:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to add featured product",
      });
    }
  }

  /**
   * Update a featured product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateFeaturedProduct(req, res) {
    try {
      const {id} = req.params;
      const result = await this.featuredProductService
          .updateFeaturedProduct(id, req.body);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Error updating featured product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update featured product",
      });
    }
  }

  /**
   * Remove a product from featured collection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeFeaturedProduct(req, res) {
    try {
      const {id} = req.params;
      const result = await this.featuredProductService
          .removeFeaturedProduct(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Error removing featured product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove featured product",
      });
    }
  }
}

module.exports = FeaturedProductController;
