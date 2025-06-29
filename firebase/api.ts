// Direct Firebase Functions API utilities
// No Next.js backend - only Firebase Cloud Functions

// Base URL for Firebase Functions API
const API_BASE_URL = 'https://us-central1-dreamy-delights-882ff.cloudfunctions.net/api';

// Legacy Direct Function URLs (for backward compatibility)
const FUNCTION_URLS = {
  getFeaturedProducts: 'https://getfeaturedproducts-cvfhs7orea-uc.a.run.app',
  getProducts: 'https://getproducts-cvfhs7orea-uc.a.run.app',
  getAllOrders: 'https://getallorders-cvfhs7orea-uc.a.run.app',
  manageProduct: 'https://manageproduct-cvfhs7orea-uc.a.run.app',
  getServerTime: 'https://getservertime-cvfhs7orea-uc.a.run.app'
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

// PUBLIC API FUNCTIONS (No authentication required)

export const fetchFeaturedProducts = async () => {
  try {
    // Try new unified API first, fallback to legacy endpoint
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/products/featured`);
    } catch (error) {
      console.warn('New API unavailable, using legacy endpoint');
      response = await fetch(FUNCTION_URLS.getFeaturedProducts);
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
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
