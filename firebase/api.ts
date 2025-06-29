// Direct Firebase Functions API utilities
// No Next.js backend - only Firebase Cloud Functions

// Base URL for Firebase Functions API
const API_BASE_URL = 'https://api-cvfhs7orea-uc.a.run.app/api';

// Use the main API endpoint for all requests
const FUNCTION_URLS = {
  getFeaturedProducts: `${API_BASE_URL}/products?featured=true`,
  getProducts: `${API_BASE_URL}/products`,
  getAllOrders: `${API_BASE_URL}/admin/orders`,
  manageProduct: `${API_BASE_URL}/admin/products`,
  getServerTime: `${API_BASE_URL}/time`
};

// Base URL for Firebase Functions (for callable functions)
const FUNCTIONS_BASE_URL = 'https://us-central1-dreamy-delights-882ff.cloudfunctions.net';

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
const getAdminToken = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const encryptedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!encryptedToken) return null;

    // Import encryption utility dynamically to avoid SSR issues
    const { ClientEncryption } = require('@/utils/encryption');
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
      // Import encryption utility dynamically to avoid SSR issues
      const { ClientEncryption } = require('@/utils/encryption');
      const tokenData = {
        token,
        timestamp: Date.now(),
      };
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
}) => {
  try {
    return await callFunction('createOrder', orderData);
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

export const fetchTestimonials = async (params: {
  limit?: number;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_BASE_URL}/testimonials${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch testimonials`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    
    // Return empty result structure instead of throwing
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const fetchFeaturedTestimonials = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/testimonials/featured`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch featured testimonials`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured testimonials:', error);
    
    // Return empty result structure instead of throwing
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Admin API Functions
export const adminLogin = async (credentials: {
  username: string;
  password: string;
}) => {
  try {
    const { functions } = await import('./init');
    const { httpsCallable } = await import('firebase/functions');
    
    const loginFunction = httpsCallable(functions, 'adminLogin');
    const result = await loginFunction(credentials);
    
    if (result.data && (result.data as any).success) {
      setAdminToken((result.data as any).token);
    }
    
    return result.data;
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
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin products:', error);
    throw error;
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
  try {
    console.log('🌐 adminUpdateProductJSON called with:', {
      id,
      idType: typeof id,
      idLength: id ? id.length : 0,
      productData,
      url: `${API_BASE_URL}/admin/products/${id}`
    });
    
    // Validate inputs
    if (!id || typeof id !== 'string') {
      console.error('🌐 Invalid product ID:', { id, type: typeof id });
      throw new Error('Invalid product ID provided');
    }
    
    if (!productData || typeof productData !== 'object') {
      console.error('🌐 Invalid product data:', { productData, type: typeof productData });
      throw new Error('Invalid product data provided');
    }
    
    const response = await fetchWithAdminAuth(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    
    const result = await response.json();
    console.log('🌐 adminUpdateProductJSON response:', result);
    return result;
  } catch (error) {
    console.error('🌐 Error updating product (JSON):', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      id,
      productData
    });
    throw error;
  }
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
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Dashboard stats fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

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
