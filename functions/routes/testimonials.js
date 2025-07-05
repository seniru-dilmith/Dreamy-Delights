const express = require("express");
const TestimonialController = require("../controllers/TestimonialController");
const {
  verifyAdminToken,
  requirePermission,
} = require("../middleware/adminAuth");

/**
 * Testimonial Routes - Express router for testimonial-related endpoints
 */
// eslint-disable-next-line new-cap
const router = express.Router();
const testimonialController = new TestimonialController();

// Public routes - no authentication required
router.get("/", (req, res) =>
  testimonialController.getTestimonials(req, res));
router.get("/featured", (req, res) =>
  testimonialController.getFeaturedTestimonials(req, res));

// Admin routes - require admin authentication and testimonial permission
router.post("/",
    verifyAdminToken,
    requirePermission("manage_testimonials"),
    (req, res) => testimonialController.createTestimonial(req, res));
router.put("/:id",
    verifyAdminToken,
    requirePermission("manage_testimonials"),
    (req, res) => testimonialController.updateTestimonial(req, res));
router.delete("/:id",
    verifyAdminToken,
    requirePermission("manage_testimonials"),
    (req, res) => testimonialController.deleteTestimonial(req, res));

module.exports = router;
