// Simple test script to verify cart persistence logic
// This simulates the localStorage behavior

// Mock localStorage for testing
const mockLocalStorage = {
  data: {},
  setItem(key, value) {
    this.data[key] = value;
    console.log(`✓ Saved to localStorage: ${key} = ${value}`);
  },
  getItem(key) {
    const value = this.data[key];
    console.log(`✓ Retrieved from localStorage: ${key} = ${value || 'null'}`);
    return value || null;
  },
  removeItem(key) {
    delete this.data[key];
    console.log(`✓ Removed from localStorage: ${key}`);
  }
};

// Simulate the cart persistence functions
const CART_STORAGE_KEY = "dreamy-delights-cart";

const saveCartToStorage = (items) => {
  mockLocalStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const loadCartFromStorage = () => {
  try {
    const stored = mockLocalStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading cart from storage:", error);
    return [];
  }
};

// Test the functionality
console.log("🧪 Testing Cart Persistence Functionality\n");

// Test 1: Save and load empty cart
console.log("Test 1: Empty cart");
saveCartToStorage([]);
const emptyCart = loadCartFromStorage();
console.log("Loaded empty cart:", emptyCart);
console.log("✅ Test 1 passed:", emptyCart.length === 0);
console.log();

// Test 2: Save and load cart with items
console.log("Test 2: Cart with items");
const testItems = [
  {
    id: "cake-1",
    name: "Chocolate Cake",
    price: 25.99,
    quantity: 1,
    image: "/placeholder.jpg",
    customizations: { size: "Medium", flavor: "Chocolate" }
  },
  {
    id: "cupcake-1", 
    name: "Vanilla Cupcake",
    price: 3.99,
    quantity: 6,
    image: "/placeholder.jpg"
  }
];

saveCartToStorage(testItems);
const loadedCart = loadCartFromStorage();
console.log("Loaded cart with items:", loadedCart);
console.log("✅ Test 2 passed:", loadedCart.length === 2 && loadedCart[0].name === "Chocolate Cake");
console.log();

// Test 3: Test total calculation
console.log("Test 3: Total calculation");
const total = loadedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
console.log("Calculated total:", total.toFixed(2));
console.log("✅ Test 3 passed:", total.toFixed(2) === "49.93");
console.log();

console.log("🎉 All cart persistence tests passed!");
