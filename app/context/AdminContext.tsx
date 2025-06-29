"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { 
  adminLogin, 
  adminLogout, 
  setAdminToken 
} from "@/firebase/api";
import { ClientEncryption } from "@/utils/encryption";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  permissions: string[];
  lastLogin: Date;
}

interface AdminContextType {
  admin: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_TOKEN_KEY = 'dreamy_admin_token';
const ADMIN_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing admin session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    console.log('AdminContext: Checking existing session...');
    try {
      const encryptedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!encryptedToken) {
        console.log('AdminContext: No encrypted token found in localStorage');
        setLoading(false);
        return;
      }

      console.log('AdminContext: Found encrypted token, decrypting...');
      // Decrypt token
      const tokenData = JSON.parse(ClientEncryption.decrypt(encryptedToken));
      
      // Check if token is expired (4 hours from storage timestamp)
      const tokenAge = Date.now() - tokenData.timestamp;
      console.log('AdminContext: Token age:', tokenAge, 'ms (max:', ADMIN_SESSION_DURATION, 'ms)');
      
      if (tokenAge > ADMIN_SESSION_DURATION) {
        console.log('AdminContext: Token expired, removing from localStorage');
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setLoading(false);
        return;
      }

      // Decode JWT to check expiration and get admin data
      try {
        console.log('AdminContext: Decoding JWT...');
        const tokenParts = tokenData.token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('AdminContext: JWT payload:', payload);
        
        // Check if JWT is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.log('AdminContext: JWT token expired');
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          setLoading(false);
          return;
        }

        // Create admin object from JWT payload
        const adminData: AdminUser = {
          id: payload.adminId,
          username: payload.username,
          email: payload.email || '',
          role: payload.role as "super_admin" | "admin" | "editor",
          permissions: payload.permissions || [],
          lastLogin: new Date(),
        };

        console.log('AdminContext: Restoring session for admin:', adminData.username);
        setAdmin(adminData);
        setAdminToken(tokenData.token);
        console.log('AdminContext: Session restored successfully');
      } catch (jwtError) {
        console.error('AdminContext: Error decoding JWT:', jwtError);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
    } catch (error) {
      console.error('AdminContext: Session check failed:', error);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('AdminContext: Starting login for username:', username);

      // Validate inputs before sending
      if (!username || !password) {
        console.error('AdminContext: Missing username or password');
        return false;
      }

      const credentials = {
        username: username.toLowerCase().trim(),
        password: password, // Send plain password, not hashed
      };

      console.log('AdminContext: Calling adminLogin...');
      const result = await adminLogin(credentials) as any;
      console.log('AdminContext: Login result:', result);

      const resultData = result as { success: boolean; admin?: AdminUser; token?: string };
      if (resultData.success && resultData.admin && resultData.token) {
        const { admin: adminData, token } = resultData;
        
        console.log('AdminContext: Login successful, storing token...');
        // Encrypt and store token
        const tokenData = {
          token,
          timestamp: Date.now(),
        };
        const encryptedToken = ClientEncryption.encrypt(JSON.stringify(tokenData));
        localStorage.setItem(ADMIN_TOKEN_KEY, encryptedToken);
        console.log('AdminContext: Token stored in localStorage');

        setAdmin(adminData);
        setAdminToken(token);
        console.log('AdminContext: Admin state updated');
        return true;
      }

      console.log('AdminContext: Login failed - invalid response');
      return false;
    } catch (error) {
      console.error('AdminContext: Admin login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call backend logout to invalidate token
      await adminLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of backend response
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setAdmin(null);
      setAdminToken(null);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!admin) return false;
    
    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;
    
    return admin.permissions.includes(permission);
  };

  const value: AdminContextType = {
    admin,
    login,
    logout,
    isAuthenticated: !!admin,
    loading,
    hasPermission,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Admin permission constants
export const ADMIN_PERMISSIONS = {
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_ORDERS: 'manage_orders', 
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ADMINS: 'manage_admins',
  DEBUG: 'debug',
} as const;
