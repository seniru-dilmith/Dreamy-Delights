const admin = require("firebase-admin");
const {v4: uuidv4} = require("uuid");

/**
 * Admin Product Service - Handles product management operations
 */
class AdminProductService {
  /**
   * Constructor for AdminProductService
   */
  constructor() {
    this.db = admin.firestore();
    this.storage = admin.storage();
    this.bucket = this.storage.bucket();
  }

  /**
   * Get all products
   * @return {Array} Array of products
   */
  async getAllProducts() {
    try {
      const snapshot = await this.db.collection("products")
          .orderBy("createdAt", "desc")
          .get();

      const products = [];
      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  /**
   * Upload image to Firebase Storage
   * @param {Buffer} buffer - Image buffer
   * @param {string} originalname - Original filename
   * @param {string} mimetype - File mimetype
   * @return {string} Image URL
   */
  async uploadImage(buffer, originalname, mimetype) {
    try {
      // Check if storage bucket exists first
      console.log("Checking if storage bucket exists:", this.bucket.name);

      const [exists] = await this.bucket.exists();
      if (!exists) {
        console.log("❌ Storage bucket does not exist");
        throw new Error("Firebase Storage is not enabled. Please enable " +
          "Firebase Storage in the Firebase Console and try again.");
      }

      console.log("✅ Storage bucket exists, proceeding with upload");

      const fileName = `products/${uuidv4()}-${originalname}`;
      const file = this.bucket.file(fileName);

      await file.save(buffer, {
        metadata: {
          contentType: mimetype,
        },
      });
      console.log("Image saved to storage:", fileName);

      // Make file publicly readable
      await file.makePublic();
      console.log("Image made public");

      const imageUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
      console.log("Image URL generated:", imageUrl);

      return imageUrl;
    } catch (storageError) {
      console.error("Storage error details:", storageError);

      if (storageError.message &&
          storageError.message.includes("bucket does not exist")) {
        throw new Error("Firebase Storage bucket not found. Please enable " +
          "Firebase Storage in the Firebase Console.");
      } else if (storageError.code === "storage/unauthorized") {
        throw new Error("Storage unauthorized. Please check Firebase " +
          "Storage rules and service account permissions.");
      } else {
        throw new Error(`Image upload failed: ${storageError.message}`);
      }
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {string} adminId - Admin ID who created the product
   * @return {Object} Created product with ID
   */
  async createProduct(productData, adminId) {
    try {
      const {
        name,
        description,
        price,
        category,
        available,
        featured,
        stock,
        active,
        imageUrl,
      } = productData;

      // Validate required fields
      if (!name || !description || !price || !category) {
        throw new Error("Name, description, price, and category are required");
      }

      const newProductData = {
        name,
        description,
        price: parseFloat(price),
        category,
        available: available === "true" || available === true,
        featured: featured === "true" || featured === true,
        stock: stock !== undefined ? parseInt(stock) : 0,
        active: active !== undefined ?
          (active === "true" || active === true) : true,
        imageUrl: imageUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: adminId,
      };

      const docRef = await this.db.collection("products").add(newProductData);
      console.log("Product saved to Firestore with ID:", docRef.id);

      return {
        id: docRef.id,
        ...newProductData,
      };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  /**
   * Update a product
   * @param {string} productId - Product ID
   * @param {Object} updateData - Update data
   * @param {string} adminId - Admin ID who updated the product
   * @return {boolean} Success status
   */
  async updateProduct(productId, updateData, adminId) {
    try {
      // Validate product ID
      if (!productId || typeof productId !== "string" ||
          productId.trim() === "") {
        throw new Error("Invalid product ID provided");
      }

      const productRef = this.db.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new Error("Product not found");
      }

      const {
        name,
        description,
        price,
        category,
        available,
        featured,
        stock,
        active,
        imageUrl,
      } = updateData;

      const updateFields = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: adminId,
      };

      // Update fields if provided
      if (name !== undefined && name !== "") updateFields.name = name;
      if (description !== undefined) updateFields.description = description;
      if (price !== undefined && !isNaN(parseFloat(price))) {
        updateFields.price = parseFloat(price);
      }
      if (category !== undefined && category !== "") {
        updateFields.category = category;
      }
      if (available !== undefined) {
        updateFields.available = available === "true" || available === true;
      }
      if (featured !== undefined) {
        updateFields.featured = featured === "true" || featured === true;
      }
      if (stock !== undefined && !isNaN(parseInt(stock))) {
        updateFields.stock = parseInt(stock);
      }
      if (active !== undefined) {
        updateFields.active = active === "true" || active === true;
      }
      if (imageUrl !== undefined && imageUrl !== "") {
        updateFields.imageUrl = imageUrl;
      }

      await productRef.update(updateFields);
      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @return {boolean} Success status
   */
  async deleteProduct(productId) {
    try {
      const productRef = this.db.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new Error("Product not found");
      }

      // TODO: Delete associated image from storage

      await productRef.delete();
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  /**
   * Toggle product featured status
   * @param {string} productId - Product ID
   * @param {string} adminId - Admin ID
   * @return {Object} Updated featured status
   */
  async toggleFeatured(productId, adminId) {
    try {
      const productRef = this.db.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new Error("Product not found");
      }

      const currentData = productDoc.data();
      const newFeaturedStatus = !currentData.featured;

      await productRef.update({
        featured: newFeaturedStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: adminId,
      });

      return {
        featured: newFeaturedStatus,
        message: newFeaturedStatus ?
          "Product added to featured products" :
          "Product removed from featured products",
      };
    } catch (error) {
      console.error("Error toggling featured status:", error);
      throw error;
    }
  }
}

module.exports = AdminProductService;
