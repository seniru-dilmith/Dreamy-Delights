#!/bin/bash

# Test script to verify FormData upload with curl
# This will help us understand if the issue is with the Node.js form-data package or the server

ADMIN_TOKEN="test-admin-token-bypass"
API_URL="https://api-cvfhs7orea-uc.a.run.app/api/admin/products"
IMAGE_FILE="./public/logo-large.png"

echo "=== Testing FormData Upload with curl ==="

# First create a simple product
echo "📄 Creating a simple product first..."
PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Curl Test Product",
    "description": "Product created via curl",
    "price": 15.99,
    "category": "Cakes",
    "stock": 3,
    "available": true,
    "featured": false
  }')

echo "Create response: $PRODUCT_RESPONSE"

# Extract product ID
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Product ID: $PRODUCT_ID"

if [ -z "$PRODUCT_ID" ]; then
  echo "❌ Failed to create product or extract ID"
  exit 1
fi

# Now test image upload
echo "📸 Testing image upload via curl FormData..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/$PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Curl Test Product WITH Image" \
  -F "description=This product now has an image uploaded via curl!" \
  -F "price=19.99" \
  -F "image=@$IMAGE_FILE")

echo "Update response: $UPDATE_RESPONSE"

echo "✅ Test completed"
