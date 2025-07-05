const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes");

// Load environment variables
require("dotenv").config();

// Initialize Firebase Admin SDK with environment variables
console.log("Initializing Firebase Admin SDK with storage bucket from env");

const serviceAccount = require(
    "./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FB_STORAGE_BUCKET,
  projectId: process.env.FB_PROJECT_ID,
  databaseURL: process.env.FB_DATABASE_URL,
});

// Create Express app
const app = express();

// CORS options - explicitly allow production domain
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://thedreamydelights.com",
    "https://www.thedreamydelights.com",
    "https://dreamy-delights-882ff.web.app",
    "https://dreamy-delights-882ff.firebaseapp.com",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware for CORS and JSON
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Mount API routes under /api prefix
app.use("/api", apiRouter);

// Export a single HTTP function
exports.api = functions.https.onRequest(app);

// Export authentication functions
const authFunctions = require("./auth");
exports.loginWithEmail = authFunctions.loginWithEmail;
exports.loginWithGoogle = authFunctions.loginWithGoogle;
exports.registerWithEmail = authFunctions.registerWithEmail;
exports.logout = authFunctions.logout;
exports.getCurrentUser = authFunctions.getCurrentUser;
exports.refreshToken = authFunctions.refreshToken;
exports.setUserRole = authFunctions.setUserRole;
