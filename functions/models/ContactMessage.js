const admin = require("firebase-admin");

/**
 * ContactMessage Model - Handles all contact message database operations
 */
class ContactMessageModel {
  /**
   * Initialize the ContactMessage Model
   */
  constructor() {
    // Lazy-load Firestore to avoid initialization issues
    this._db = null;
    this._collection = null;
  }

  /**
   * Get Firestore database instance
   * @return {Object} Firestore database
   */
  get db() {
    if (!this._db) {
      this._db = admin.firestore();
    }
    return this._db;
  }

  /**
   * Get contact_messages collection
   * @return {Object} Firestore collection
   */
  get collection() {
    if (!this._collection) {
      this._collection = this.db.collection("contact_messages");
    }
    return this._collection;
  }

  /**
   * Get all contact messages with optional filtering
   * @param {Object} options - Query options
   * @return {Promise<Array>} Array of contact messages
   */
  async getAll(options = {}) {
    try {
      let query = this.collection.orderBy("createdAt", "desc");

      // Apply limit if specified
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Apply status filter if specified
      if (options.status) {
        query = query.where("status", "==", options.status);
      }

      // Apply date filter if specified
      if (options.startDate) {
        query = query.where("createdAt", ">=", options.startDate);
      }

      if (options.endDate) {
        query = query.where("createdAt", "<=", options.endDate);
      }

      const snapshot = await query.get();
      const messages = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps for JSON serialization
          createdAt: data.createdAt && data.createdAt.toDate ?
            data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt && data.updatedAt.toDate ?
            data.updatedAt.toDate() : data.updatedAt,
        });
      });

      return messages;
    } catch (error) {
      console.error("Error getting contact messages:", error);
      throw error;
    }
  }

  /**
   * Get a single contact message by ID
   * @param {string} id - Contact message ID
   * @return {Promise<Object|null>} Contact message object or null if not found
   */
  async getById(id) {
    try {
      if (!id || typeof id !== "string") {
        return null;
      }

      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamps for JSON serialization
        createdAt: data.createdAt && data.createdAt.toDate ?
          data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt && data.updatedAt.toDate ?
          data.updatedAt.toDate() : data.updatedAt,
      };
    } catch (error) {
      console.error("Error getting contact message by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new contact message
   * @param {Object} messageData - Contact message data
   * @return {Promise<Object>} Created contact message
   */
  async create(messageData) {
    try {
      // Validate required fields
      if (!messageData.firstName || typeof messageData.firstName !== "string") {
        throw new Error("First name is required and must be a string");
      }

      if (!messageData.lastName || typeof messageData.lastName !== "string") {
        throw new Error("Last name is required and must be a string");
      }

      if (!messageData.email || typeof messageData.email !== "string") {
        throw new Error("Email is required and must be a string");
      }

      if (!messageData.subject || typeof messageData.subject !== "string") {
        throw new Error("Subject is required and must be a string");
      }

      if (!messageData.message || typeof messageData.message !== "string") {
        throw new Error("Message is required and must be a string");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(messageData.email)) {
        throw new Error("Invalid email format");
      }

      const now = admin.firestore.FieldValue.serverTimestamp();
      const data = {
        firstName: messageData.firstName.trim(),
        lastName: messageData.lastName.trim(),
        email: messageData.email.trim().toLowerCase(),
        phone: messageData.phone ? messageData.phone.trim() : null,
        subject: messageData.subject.trim(),
        message: messageData.message.trim(),
        status: "unread", // Default status
        priority: "normal", // Default priority
        source: "website", // Source of the message
        ipAddress: messageData.ipAddress || null,
        userAgent: messageData.userAgent || null,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(data);

      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error creating contact message:", error);
      throw error;
    }
  }

  /**
   * Update a contact message
   * @param {string} id - Contact message ID
   * @param {Object} updateData - Data to update
   * @return {Promise<Object>} Updated contact message
   */
  async update(id, updateData) {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid contact message ID is required");
      }

      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error("Contact message not found");
      }

      // Prepare update data
      const data = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Remove undefined values
      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
          delete data[key];
        }
      });

      await docRef.update(data);

      // Get updated document
      const updatedDoc = await docRef.get();
      const updatedData = updatedDoc.data();

      return {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: updatedData.createdAt && updatedData.createdAt.toDate ?
          updatedData.createdAt.toDate() : updatedData.createdAt,
        updatedAt: updatedData.updatedAt && updatedData.updatedAt.toDate ?
          updatedData.updatedAt.toDate() : updatedData.updatedAt,
      };
    } catch (error) {
      console.error("Error updating contact message:", error);
      throw error;
    }
  }

  /**
   * Mark a contact message as read
   * @param {string} id - Contact message ID
   * @param {string} adminId - ID of admin marking as read
   * @return {Promise<Object>} Updated contact message
   */
  async markAsRead(id, adminId = null) {
    try {
      const updateData = {
        status: "read",
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (adminId) {
        updateData.readBy = adminId;
      }

      return await this.update(id, updateData);
    } catch (error) {
      console.error("Error marking contact message as read:", error);
      throw error;
    }
  }

  /**
   * Mark a contact message as replied
   * @param {string} id - Contact message ID
   * @param {string} adminId - ID of admin replying
   * @param {string} replyText - Reply text (optional)
   * @return {Promise<Object>} Updated contact message
   */
  async markAsReplied(id, adminId = null, replyText = null) {
    try {
      const updateData = {
        status: "replied",
        repliedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (adminId) {
        updateData.repliedBy = adminId;
      }

      if (replyText) {
        updateData.reply = replyText.trim();
      }

      return await this.update(id, updateData);
    } catch (error) {
      console.error("Error marking contact message as replied:", error);
      throw error;
    }
  }

  /**
   * Delete a contact message
   * @param {string} id - Contact message ID
   * @return {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid contact message ID is required");
      }

      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error("Contact message not found");
      }

      await docRef.delete();
      return true;
    } catch (error) {
      console.error("Error deleting contact message:", error);
      throw error;
    }
  }

  /**
   * Get contact message statistics
   * @return {Promise<Object>} Statistics object
   */
  async getStats() {
    try {
      const snapshot = await this.collection.get();
      const total = snapshot.size;

      let unread = 0;
      let read = 0;
      let replied = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let todayCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Count by status
        switch (data.status) {
          case "unread":
            unread++;
            break;
          case "read":
            read++;
            break;
          case "replied":
            replied++;
            break;
        }

        // Count today's messages
        const createdAt = data.createdAt && data.createdAt.toDate ?
          data.createdAt.toDate() : new Date(data.createdAt);
        if (createdAt >= today) {
          todayCount++;
        }
      });

      return {
        total,
        unread,
        read,
        replied,
        todayCount,
      };
    } catch (error) {
      console.error("Error getting contact message stats:", error);
      throw error;
    }
  }
}

module.exports = ContactMessageModel;
