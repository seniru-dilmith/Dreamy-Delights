// Shared product types for the frontend
// This ensures consistency across all components

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
  imageUrl?: string;
  image?: string; // Fallback for backward compatibility
  imagePath?: string;
  featured?: boolean;
  active?: boolean;
  available?: boolean; // Alias for active
  rating?: number;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  customizations?: {
    sizes?: string[];
    flavors?: string[];
    decorations?: string[];
    [key: string]: any;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string; // URL to the product image
  customizations?: {
    size?: string;
    flavor?: string;
    decoration?: string;
    [key: string]: any;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  featured?: boolean;
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  active?: boolean;
  featured?: boolean;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

// Helper function to get product image URL with fallback
export const getProductImageUrl = (product: Product): string => {
  return product.imageUrl || product.image || "/placeholder.jpg";
};

// Helper function to check if product is available
export const isProductAvailable = (product: Product): boolean => {
  return (product.active ?? product.available ?? true) && (product.stock ?? 0) > 0;
};

// Helper function to format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(price);
};
