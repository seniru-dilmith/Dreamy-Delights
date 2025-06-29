#!/bin/bash

# Deploy Firebase Cloud Functions
# Run this script to deploy the updated testimonial routes

echo "🚀 Deploying Firebase Cloud Functions..."

# Navigate to the functions directory
cd functions

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Deploy functions
echo "🔧 Deploying functions..."
firebase deploy --only functions

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the testimonial CRUD operations in the admin panel"
echo "2. Use the Debug Panel to troubleshoot any issues"
echo "3. Check the Firebase Console for function logs if needed"
