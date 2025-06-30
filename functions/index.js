const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes");

// Initialize Firebase Admin SDKfirebase deploy --only functionsfirebase
// deploy --only functionsfirebase deploy --only functionsfirebase
// deploy --only functionsfirebase deploy --only functionsfirebase
// deploy --only functionsfirebase deploy --only functions
admin.initializeApp({
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// Create Express app
const app = express();

// CORS options
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware for CORS and JSON
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Mount API routes
app.use("/", apiRouter);

// Export a single HTTP function
exports.api = functions.https.onRequest(app);
