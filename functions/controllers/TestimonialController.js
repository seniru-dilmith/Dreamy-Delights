const TestimonialModel = require("../models/Testimonial");

/**
 * Testimonial Controller - Handles testimonial-related operations
 */
class TestimonialController {
  /**
   * Constructor
   */
  constructor() {
    this.testimonialModel = new TestimonialModel();
  }

  /**
   * Get all testimonials
   * GET /api/testimonials
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTestimonials(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const options = {limit};

      const testimonials = await this.testimonialModel.getAll(options);

      res.json({
        success: true,
        data: testimonials,
        total: testimonials.length,
      });
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch testimonials",
      });
    }
  }

  /**
   * Get featured testimonials (for homepage)
   * GET /api/testimonials/featured
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFeaturedTestimonials(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 3;
      const testimonials = await this.testimonialModel.getFeatured(limit);

      res.json({
        success: true,
        data: testimonials,
        total: testimonials.length,
      });
    } catch (error) {
      console.error("Error fetching featured testimonials:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch featured testimonials",
      });
    }
  }

  /**
   * Create a new testimonial
   * POST /api/testimonials
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createTestimonial(req, res) {
    try {
      const {name, text, rating, featured = false} = req.body;

      // Validate input data
      const testimonialData = {name, text, rating: parseInt(rating), featured};
      const validation = this.testimonialModel.validateData(testimonialData);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: validation.errors,
        });
      }

      const testimonial = await this.testimonialModel.create(testimonialData);

      res.status(201).json({
        success: true,
        data: testimonial,
        message: "Testimonial created successfully",
      });
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create testimonial",
      });
    }
  }

  /**
   * Update a testimonial
   * PUT /api/testimonials/:id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTestimonial(req, res) {
    try {
      const {id} = req.params;
      const {name, text, rating, featured} = req.body;

      // Check if testimonial exists
      const exists = await this.testimonialModel.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          error: "Testimonial not found",
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (text !== undefined) updateData.text = text;
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            error: "Rating must be between 1 and 5",
          });
        }
        updateData.rating = parseInt(rating);
      }
      if (featured !== undefined) updateData.featured = Boolean(featured);

      const updatedTestimonial = await this.testimonialModel
          .update(id, updateData);

      res.json({
        success: true,
        data: updatedTestimonial,
        message: "Testimonial updated successfully",
      });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update testimonial",
      });
    }
  }

  /**
   * Delete a testimonial
   * DELETE /api/testimonials/:id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteTestimonial(req, res) {
    try {
      const {id} = req.params;

      // Check if testimonial exists
      const exists = await this.testimonialModel.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          error: "Testimonial not found",
        });
      }

      await this.testimonialModel.delete(id);

      res.json({
        success: true,
        message: "Testimonial deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete testimonial",
      });
    }
  }
}

module.exports = TestimonialController;
