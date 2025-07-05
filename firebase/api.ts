// Direct Firebase Functions API utilities
import { ClientEncryption } from '@/utils/encryption';

// No Next.js backend - only Firebase Cloud Functions

// Base URL for Firebase HTTP functions (exposed to client)
// Uses public env var NEXT_PUBLIC_FUNCTIONS_URL and includes the '/api' path for HTTP endpoints
const API_BASE_URL = `${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/api`;

// Use the main API endpoint for all requests
const FUNCTION_URLS = {
  getFeaturedProducts: `${API_BASE_URL}/products?featured=true`,
  getProducts: `${API_BASE_URL}/products`,
  getAllOrders: `${API_BASE_URL}/admin/orders`,
  manageProduct: `${API_BASE_URL}/admin/products`,
  getServerTime: `${API_BASE_URL}/time`
};

// Base URL for Firebase Functions (for callable functions)
const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL;

// Helper function to get auth token (client-side only)
const getAuthToken = async () => {
  // This will only work on client-side with Firebase Auth
  if (typeof window === 'undefined') return null;
  
  try {
    const { auth } = await import('./init');
    if (!auth?.currentUser) return null;
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function for HTTP requests with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Helper for Firebase callable functions
const callFunction = async (functionName: string, data?: any) => {
  if (typeof window === 'undefined') {
    throw new Error('Callable functions only work on client-side');
  }

  try {
    const { functions } = await import('./init');
    if (!functions) throw new Error('Firebase functions not initialized');
    
    const { httpsCallable } = await import('firebase/functions');
    const callable = httpsCallable(functions, functionName);
    const result = await callable(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw error;
  }
};

// Admin token management
// Admin token management with localStorage (synced with AdminContext)
const ADMIN_TOKEN_KEY = 'dreamy_admin_token';
const ADMIN_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

// Helper function to get admin auth token from localStorage
export const getAdminToken = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const encryptedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!encryptedToken) return null;

    // Use imported ClientEncryption
    const tokenData = JSON.parse(ClientEncryption.decrypt(encryptedToken));
    
    // Check if token is expired
    if (Date.now() - tokenData.timestamp > ADMIN_SESSION_DURATION) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      return null;
    }
    
    return tokenData.token;
  } catch (error) {
    console.error('Error getting admin token:', error);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return null;
  }
};

// Helper function to set admin auth token in localStorage (synced with AdminContext)
export const setAdminToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  
  if (token) {
    try {
      // Use imported ClientEncryption
      const tokenData = { token, timestamp: Date.now() };
      const encryptedToken = ClientEncryption.encrypt(JSON.stringify(tokenData));
      localStorage.setItem(ADMIN_TOKEN_KEY, encryptedToken);
    } catch (error) {
      console.error('Error setting admin token:', error);
    }
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

// Helper function for admin HTTP requests with auth
const fetchWithAdminAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAdminToken();
  console.log('🔐 fetchWithAdminAuth called:', {
    url,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
  });
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type if it's not FormData (for file uploads)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.error('🔐 No admin token available for request');
  }

  console.log('🔐 Request headers:', headers);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('🔐 Response status:', response.status);
  console.log('🔐 Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('🔐 Request failed:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response;
};

// PUBLIC API FUNCTIONS (No authentication required)

export const fetchFeaturedProducts = async () => {
  try {
    // Use the unified products endpoint with featured filter
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch featured products`);
    }
    
    const data = await response.json();
    
    // Ensure consistent response format
    if (data.success && Array.isArray(data.data)) {
      return {
        success: true,
        data: data.data,
        count: data.count || data.data.length,
        message: data.message || `Found ${data.data.length} featured products`
      };
    } else {
      return {
        success: false,
        data: [],
        count: 0,
        error: data.error || 'No featured products found'
      };
    }
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return {
      success: false,
      data: [],
      count: 0,
      error: 'Failed to fetch featured products'
    };
  }
};

export const fetchProducts = async (params: {
  page?: number;
  limit?: number;
  category?: string;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);

    const url = `${FUNCTION_URLS.getProducts}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// AUTHENTICATED USER API FUNCTIONS

export const fetchUserOrders = async () => {
  try {
    return await callFunction('getUserOrders');
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  contactPhone?: string;
  additionalNotes?: string;
  customerInfo?: {
    email: string;
    name: string;
  };
}) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: {
  name: string;
  email: string;
  phone: string;
  address: string;
}) => {
  try {
    return await callFunction('updateUserProfile', profileData);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// ADMIN API FUNCTIONS

export const fetchAllOrders = async () => {
  try {
    return await fetchWithAuth(FUNCTION_URLS.getAllOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const addProduct = async (productData: {
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  featured?: boolean;
}) => {
  try {
    return await fetchWithAuth(FUNCTION_URLS.manageProduct, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: string,
  productData: {
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;
    featured?: boolean;
  }
) => {
  try {
    return await fetchWithAuth(`${FUNCTION_URLS.manageProduct}?id=${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    return await fetchWithAuth(`${FUNCTION_URLS.manageProduct}?id=${productId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    return await callFunction('updateOrderStatus', { orderId, status });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// ==========================================
// TESTIMONIALS API
// ==========================================

export const fetchTestimonials = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/testimonials`);
    
    if (!response.ok) {
      throw new Error(`Testimonials fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
};

export const fetchFeaturedTestimonials = async (limit = 3) => {
  try {
    const response = await fetch(`${API_BASE_URL}/testimonials/featured?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Featured testimonials fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching featured testimonials:', error);
    throw error;
  }
};

export const createTestimonialAdmin = async (testimonialData: {
  name: string;
  text: string;
  rating: number;
  featured?: boolean;
}) => {
  try {
    const token = getAdminToken();
    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(testimonialData),
    });

    if (!response.ok) {
      throw new Error(`Testimonial creation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

export const updateTestimonialAdmin = async (id: string, updateData: {
  name?: string;
  text?: string;
  rating?: number;
  featured?: boolean;
}) => {
  try {
    const token = getAdminToken();
    
    if (!token) {
      throw new Error('No admin token available. Please log in again.');
    }

    console.log('🔄 Updating testimonial:', { id, updateData, tokenPreview: token.substring(0, 20) + '...' });

    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    console.log('📡 Update response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      // Get detailed error information
      const errorText = await response.text();
      console.error('❌ Update failed with response:', errorText);
      
      let errorMessage = `Testimonial update failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      } catch {
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Update successful:', result);
    return result;
  } catch (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }
};

export const deleteTestimonialAdmin = async (id: string) => {
  try {
    const token = getAdminToken();
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Testimonial deletion failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
};

// Admin API Functions
export const adminLogin = async (credentials: {
  username: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Login failed');
      throw new Error(errorText);
    }

    const result = await response.json();

    if (result.success && result.token) {
      setAdminToken(result.token);
    }

    return result;
  } catch (error) {
    console.error('firebase/api: Error in admin login:', error);
    throw error;
  }
};

export const adminLogout = async () => {
  try {
    setAdminToken(null);
    
    const { functions } = await import('./init');
    const { httpsCallable } = await import('firebase/functions');
    
    const logoutFunction = httpsCallable(functions, 'adminLogout');
    return await logoutFunction({});
  } catch (error) {
    console.error('Error in admin logout:', error);
    throw error;
  }
};

export const verifyAdminToken = async (token: string) => {
  try {
    const { functions } = await import('./init');
    const { httpsCallable } = await import('firebase/functions');
    
    const verifyFunction = httpsCallable(functions, 'verifyAdminToken');
    const result = await verifyFunction({ token });
    
    return result.data;
  } catch (error) {
    console.error('Error verifying admin token:', error);
    throw error;
  }
};

export const createInitialAdmin = async (adminData: {
  username: string;
  email: string;
  password: string;
  setupKey: string;
}) => {
  try {
    const { functions } = await import('./init');
    const { httpsCallable } = await import('firebase/functions');
    
    const createAdminFunction = httpsCallable(functions, 'createInitialAdmin');
    const result = await createAdminFunction(adminData);
    
    return result.data;
  } catch (error) {
    console.error('Error creating initial admin:', error);
    throw error;
  }
};

// Admin CRUD Operations
export const adminFetchProducts = async () => {
  try {
    console.log('🛍️ Admin Products API Call:');
    console.log('- URL:', `${API_BASE_URL}/admin/products`);
    
    const token = getAdminToken();
    console.log('- Token available:', !!token);
    console.log('- Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      console.warn('No admin token available for products fetch');
      return {
        success: false,
        message: 'No authentication token',
        data: []
      };
    }

    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products`);
    const result = await response.json();
    
    console.log('📦 Admin Products API Response:', {
      success: result.success,
      dataCount: result.data?.length || 0,
      message: result.message
    });
    
    if (result.success && result.data) {
      console.log('✅ Products loaded successfully:', result.data.length, 'products');
      result.data.forEach((product: any, index: number) => {
        console.log(`  ${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error fetching admin products:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
};

export const adminCreateProduct = async (productData: FormData) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      body: productData,
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const adminCreateProductJSON = async (productData: object) => {
  try {
    console.log('🌐 adminCreateProductJSON called with:', {
      productData,
      url: `${API_BASE_URL}/admin/products`
    });
    
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    
    const result = await response.json();
    console.log('🌐 adminCreateProductJSON response:', result);
    return result;
  } catch (error) {
    console.error('🌐 Error creating product (JSON):', error);
    throw error;
  }
};

export const adminUpdateProduct = async (id: string, productData: FormData) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const adminUpdateProductJSON = async (id: string, productData: object) => {
  console.log('🌐 adminUpdateProductJSON called with:', { id, productData });
  const url = `${API_BASE_URL}/admin/products/${id}`;
  // Prepare headers
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  console.log('🌐 adminUpdateProductJSON headers:', headers);
  // Execute request
  let response: Response;
  try {
    response = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(productData) });
  } catch (networkError) {
    console.error('🌐 Network error in adminUpdateProductJSON:', networkError);
    return { success: false, message: `Network error: ${(networkError as Error).message}` };
  }
  // Parse JSON
  let result: any = {};
  try {
    result = await response.json();
  } catch (parseError) {
    console.error('🌐 JSON parse error:', parseError);
  }
  console.log('🌐 adminUpdateProductJSON raw response:', { status: response.status, statusText: response.statusText, body: result });
  // Handle HTTP errors
  if (!response.ok) {
    const message = result?.message || `HTTP ${response.status}: ${response.statusText}`;
    console.error('🌐 adminUpdateProductJSON HTTP error:', message, result);
    return { success: false, message, status: response.status, statusText: response.statusText, errorData: result };
  }
  return result;
};

export const adminDeleteProduct = async (id: string) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const adminToggleProductFeatured = async (id: string) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products/${id}/featured`, {
      method: 'PUT',
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling product featured status:', error);
    throw error;
  }
};

export const adminFetchOrders = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/orders`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
};

export const adminUpdateOrderStatus = async (id: string, status: string) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const adminFetchUsers = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/users`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

export const adminUpdateUserStatus = async (userId: string, status: string) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const adminUpdateUserRole = async (userId: string, role: string) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const adminFetchContent = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/content`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin content:', error);
    throw error;
  }
};

export const adminUpdateContent = async (section: string, contentData: any) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/content/${section}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

export const adminFetchAnalytics = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/analytics`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

export const adminFetchSettings = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/settings`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
};

export const adminUpdateSettings = async (key: string, settingData: any) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(settingData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// ADMIN API FUNCTIONS

// Fetch dashboard statistics
export const fetchDashboardStats = async () => {
  try {
    const token = getAdminToken();
    
    console.log('🔍 Dashboard Stats API Call:');
    console.log('- Token available:', !!token);
    console.log('- Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    console.log('- API URL:', `${API_BASE_URL}/admin/dashboard/stats`);
    
    if (!token) {
      console.warn('No admin token available for dashboard stats');
      return {
        success: false,
        message: 'No authentication token',
        data: getFallbackDashboardStats()
      };
    }

    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📡 Dashboard API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Dashboard API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return {
        success: false,
        message: `API Error: ${response.status} ${response.statusText}`,
        data: getFallbackDashboardStats()
      };
    }

    const result = await response.json();
    console.log('✅ Dashboard API Success:', result);
    return result;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: getFallbackDashboardStats()
    };
  }
};

// Fallback dashboard stats for when API is unavailable
const getFallbackDashboardStats = () => ({
  totalProducts: 7,
  totalOrders: 6,
  totalUsers: 7,
  totalRevenue: 135.95,
  recentOrders: 6,
  pendingOrders: 1,
  averageOrderValue: 22.66
});

// Fetch all users for admin management
export const fetchAllUsers = async () => {
  try {
    const token = getAdminToken();
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Users fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch all orders for admin management  
export const fetchAllOrdersAdmin = async () => {
  try {
    const token = getAdminToken();
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Orders fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fetch all products for admin management
export const fetchAllProductsAdmin = async () => {
  try {
    const token = getAdminToken();
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Products fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Cart Management Functions

/**
 * Get user's cart from database
 */
export const getCart = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customizations?: any;
}) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      body: JSON.stringify({ item }),
    });
    return response;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

/**
 * Update item quantity in cart
 */
export const updateCartItem = async (itemId: string, quantity: number) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return response;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (itemId: string) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// CONTACT MESSAGE API FUNCTIONS

/**
 * Submit a contact message (public endpoint)
 */
export const submitContactMessage = async (messageData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to submit message');
      throw new Error(errorText);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting contact message:', error);
    throw error;
  }
};

/**
 * Get all contact messages (admin only)
 */
export const adminFetchContactMessages = async (options?: {
  status?: 'unread' | 'read' | 'replied';
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams();
    
    if (options?.status) {
      params.append('status', options.status);
    }
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }

    const url = `${API_BASE_URL}/admin/contact-messages${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetchWithAdminAuth(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    throw error;
  }
};

/**
 * Get contact message statistics (admin only)
 */
export const adminFetchContactMessageStats = async () => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/contact-messages/stats`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching contact message stats:', error);
    throw error;
  }
};

/**
 * Get a specific contact message (admin only)
 */
export const adminFetchContactMessage = async (id: string) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/contact-messages/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching contact message:', error);
    throw error;
  }
};

/**
 * Mark contact message as read (admin only)
 */
export const adminMarkContactMessageAsRead = async (id: string) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/contact-messages/${id}/read`, {
      method: 'PATCH',
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking contact message as read:', error);
    throw error;
  }
};

/**
 * Mark contact message as replied (admin only)
 */
export const adminMarkContactMessageAsReplied = async (id: string, replyText?: string) => {
  try {
    const url = `${API_BASE_URL}/admin/contact-messages/${id}/reply`;
    console.log('🔍 API Call Debug:', {
      id,
      replyText,
      url,
      API_BASE_URL,
      NEXT_PUBLIC_FUNCTIONS_URL: process.env.NEXT_PUBLIC_FUNCTIONS_URL
    });
    
    const response = await fetchWithAdminAuth(url, {
      method: 'PATCH',
      body: JSON.stringify({ replyText }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking contact message as replied:', error);
    throw error;
  }
};

/**
 * Update contact message (admin only)
 */
export const adminUpdateContactMessage = async (id: string, updateData: {
  status?: 'unread' | 'read' | 'replied';
  priority?: 'low' | 'normal' | 'high';
  reply?: string;
}) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/contact-messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating contact message:', error);
    throw error;
  }
};

/**
 * Delete contact message (admin only)
 */
export const adminDeleteContactMessage = async (id: string) => {
  try {
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/contact-messages/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting contact message:', error);
    throw error;
  }
};
