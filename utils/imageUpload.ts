import { storage } from '@/firebase/init';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  fileName: string;
  fullPath: string;
}

export class ImageUploadService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private static readonly STORAGE_PATHS = {
    products: 'products',
    categories: 'categories',
    banners: 'banners',
    testimonials: 'testimonials',
  };

  static validateFile(file: File): { valid: boolean; message: string } {
    if (!file) {
      return { valid: false, message: 'No file selected' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, message: 'File size must be less than 5MB' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, message: 'Only JPEG, PNG, WebP, and GIF files are allowed' };
    }

    return { valid: true, message: 'File is valid' };
  }

  static async uploadImage(
    file: File,
    category: keyof typeof ImageUploadService.STORAGE_PATHS,
    customFileName?: string
  ): Promise<UploadResult> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = customFileName 
        ? `${customFileName}.${fileExtension}`
        : `${uuidv4()}.${fileExtension}`;
      
      const fullPath = `${this.STORAGE_PATHS[category]}/${fileName}`;
      const storageRef = ref(storage, fullPath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        fileName,
        fullPath,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  static async deleteImage(fullPath: string): Promise<void> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    try {
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  static async listImages(category: keyof typeof ImageUploadService.STORAGE_PATHS): Promise<string[]> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    try {
      const listRef = ref(storage, this.STORAGE_PATHS[category]);
      const result = await listAll(listRef);
      
      const urls = await Promise.all(
        result.items.map(async (itemRef) => {
          return await getDownloadURL(itemRef);
        })
      );

      return urls;
    } catch (error) {
      console.error('Error listing images:', error);
      throw new Error('Failed to list images');
    }
  }

  static async replaceImage(
    oldImagePath: string,
    newFile: File,
    category: keyof typeof ImageUploadService.STORAGE_PATHS,
    customFileName?: string
  ): Promise<UploadResult> {
    try {
      // Upload new image first
      const uploadResult = await this.uploadImage(newFile, category, customFileName);
      
      // Delete old image if upload was successful
      if (oldImagePath) {
        try {
          await this.deleteImage(oldImagePath);
        } catch (deleteError) {
          console.warn('Could not delete old image:', deleteError);
          // Don't fail the operation if we can't delete the old image
        }
      }

      return uploadResult;
    } catch (error) {
      console.error('Error replacing image:', error);
      throw new Error('Failed to replace image');
    }
  }

  static getImageUrlFromPath(fullPath: string): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    try {
      const storageRef = ref(storage, fullPath);
      return getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw new Error('Failed to get image URL');
    }
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static async resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        let { width: newWidth, height: newHeight } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            newHeight = (height * maxWidth) / width;
            newWidth = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            newWidth = (width * maxHeight) / height;
            newHeight = maxHeight;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async convertToWebP(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(webpFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = URL.createObjectURL(file);
    });
  }
}
