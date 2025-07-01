const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes");

// Initialize Firebase Admin SDK with explicit bucket name
console.log("Initializing Firebase Admin SDK with storage bucket");

const serviceAccount = require(
    "./dreamy-delights-882ff-firebase-adminsdk-fbsvc-e3a40b9a80.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "dreamy-delights-882ff.firebasestorage.app",
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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
