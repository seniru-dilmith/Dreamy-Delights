import CryptoJS from 'crypto-js';

// Client-side encryption utilities
export class ClientEncryption {
  private static getSecretKey(): string {
    // In production, this should come from environment or be derived from user session
    return process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'fallback-key-change-in-production';
  }

  static encrypt(text: string): string {
    try {
      const secretKey = this.getSecretKey();
      const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const secretKey = this.getSecretKey();
      const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hashPassword(password: string): string {
    try {
      const hash = CryptoJS.SHA256(password + this.getSecretKey()).toString();
      return hash;
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for server-side
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Input sanitization for admin forms
export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static sanitizeForDatabase(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    return { valid: true, message: 'Password is valid' };
  }
}
