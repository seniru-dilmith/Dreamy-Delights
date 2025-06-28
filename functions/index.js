const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.getServerTime = functions.https.onRequest((req, res) => {
  res.json({serverTime: new Date().toISOString()});
});
