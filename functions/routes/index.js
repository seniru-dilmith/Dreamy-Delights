const express = require("express");
const cors = require("cors");
const productsRouter = require("./products");
const ordersRouter = require("./orders");
const usersRouter = require("./users");
const testimonialsRouter = require("./testimonials");

/**
 * Main API Router - Combines all route modules with CORS
 */
// eslint-disable-next-line new-cap
const router = express.Router();

// Enable CORS for all routes
router.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Route modules
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/users", usersRouter);
router.use("/testimonials", testimonialsRouter);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Get server time (legacy endpoint)
router.get("/server-time", (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
  });
});

module.exports = router;
