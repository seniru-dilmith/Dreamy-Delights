"use client"

import { createContext, useContext, useReducer, useEffect, useState, useCallback, type ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from "@/firebase/api"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  customizations?: {
    size?: string
    flavor?: string
    decoration?: string
  }
}

interface CartState {
  items: CartItem[]
  total: number
  loading: boolean
  error: string | null
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_FROM_DATABASE"; payload: CartItem[] }
  | { type: "LOAD_FROM_LOCALSTORAGE"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }

const CartContext = createContext<{
  cartItems: CartItem[]
  total: number
  loading: boolean
  error: string | null
  addToCart: (item: CartItem) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncCart: () => Promise<void>
  getItemCount: () => number
} | null>(null)

const LOCALSTORAGE_CART_KEY = "dreamy-delights-cart"

// Helper functions for localStorage
const saveCartToLocalStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(LOCALSTORAGE_CART_KEY, JSON.stringify(items))
  } catch (error) {
    console.error("Error saving cart to localStorage:", error)
  }
}

const loadCartFromLocalStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(LOCALSTORAGE_CART_KEY)
    return savedCart ? JSON.parse(savedCart) : []
  } catch (error) {
    console.error("Error loading cart from localStorage:", error)
    return []
  }
}

const clearLocalStorageCart = () => {
  try {
    localStorage.removeItem(LOCALSTORAGE_CART_KEY)
  } catch (error) {
    console.error("Error clearing cart from localStorage:", error)
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
        )
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }
      }
      const newItems = [...state.items, action.payload]
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }

    case "UPDATE_QUANTITY":
      const updatedItems = state.items
        .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
        .filter((item) => item.quantity > 0)
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }

    case "CLEAR_CART":
      return { 
        ...state,
        items: [], 
        total: 0 
      }

    case "LOAD_FROM_DATABASE":
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }

    case "LOAD_FROM_LOCALSTORAGE":
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { 
    items: [], 
    total: 0, 
    loading: false, 
    error: null 
  })
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load cart from localStorage on mount (for guest users)
  useEffect(() => {
    if (!mounted) return
    
    if (typeof window !== 'undefined') {
      const localCart = loadCartFromLocalStorage()
      if (localCart.length > 0 && !user) {
        dispatch({ type: "LOAD_FROM_LOCALSTORAGE", payload: localCart })
      }
    }
  }, [mounted, user])

  // Sync cart from database when user logs in
  const syncCart = useCallback(async () => {
    if (!user) {
      // Load from localStorage for guest users
      const localCart = loadCartFromLocalStorage()
      dispatch({ type: "LOAD_FROM_LOCALSTORAGE", payload: localCart })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      // Get the current localStorage cart
      const localCart = loadCartFromLocalStorage()
      
      // Get the database cart
      const response = await getCart()
      let dbCart: CartItem[] = []
      
      if (response.success && response.cart) {
        dbCart = response.cart.items
      }

      // Merge localStorage cart with database cart if user just logged in
      if (localCart.length > 0) {
        // Merge the carts (prioritize localStorage for quantities)
        const mergedCart = [...dbCart]
        
        localCart.forEach(localItem => {
          const existingIndex = mergedCart.findIndex(item => item.id === localItem.id)
          if (existingIndex >= 0) {
            // Item exists in both - combine quantities
            mergedCart[existingIndex].quantity += localItem.quantity
          } else {
            // Item only in localStorage - add it
            mergedCart.push(localItem)
          }
        })

        // Save merged cart to database
        for (const item of localCart) {
          try {
            await apiAddToCart(item)
          } catch (error) {
            console.error("Error syncing cart item to database:", error)
          }
        }

        // Clear localStorage cart since it's now in database
        clearLocalStorageCart()
        
        // Load the updated cart from database
        const updatedResponse = await getCart()
        if (updatedResponse.success && updatedResponse.cart) {
          dispatch({ type: "LOAD_FROM_DATABASE", payload: updatedResponse.cart.items })
        } else {
          dispatch({ type: "LOAD_FROM_DATABASE", payload: mergedCart })
        }
      } else {
        // No localStorage cart, just load from database
        dispatch({ type: "LOAD_FROM_DATABASE", payload: dbCart })
      }
    } catch (error) {
      console.error("Error syncing cart:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load cart" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [user])

  const addToCart = async (item: CartItem) => {
    dispatch({ type: "SET_ERROR", payload: null })

    if (!user) {
      // For guest users, store in localStorage
      dispatch({ type: "ADD_ITEM", payload: item })
      const updatedItems = [...state.items]
      const existingIndex = updatedItems.findIndex(existingItem => existingItem.id === item.id)
      
      if (existingIndex >= 0) {
        updatedItems[existingIndex].quantity += item.quantity
      } else {
        updatedItems.push(item)
      }
      
      saveCartToLocalStorage(updatedItems)
      return
    }

    // For logged-in users, sync with database
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const response = await apiAddToCart(item)
      if (response.success && response.cart) {
        dispatch({ type: "LOAD_FROM_DATABASE", payload: response.cart.items })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to add item to cart" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const removeFromCart = async (id: string) => {
    dispatch({ type: "SET_ERROR", payload: null })

    if (!user) {
      // For guest users, remove from localStorage
      dispatch({ type: "REMOVE_ITEM", payload: id })
      const updatedItems = state.items.filter(item => item.id !== id)
      saveCartToLocalStorage(updatedItems)
      return
    }

    // For logged-in users, sync with database
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const response = await apiRemoveFromCart(id)
      if (response.success && response.cart) {
        dispatch({ type: "LOAD_FROM_DATABASE", payload: response.cart.items })
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to remove item from cart" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    dispatch({ type: "SET_ERROR", payload: null })

    if (!user) {
      // For guest users, update in localStorage
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
      const updatedItems = state.items
        .map(item => item.id === id ? { ...item, quantity } : item)
        .filter(item => item.quantity > 0)
      saveCartToLocalStorage(updatedItems)
      return
    }

    // For logged-in users, sync with database
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const response = await updateCartItem(id, quantity)
      if (response.success && response.cart) {
        dispatch({ type: "LOAD_FROM_DATABASE", payload: response.cart.items })
      }
    } catch (error) {
      console.error("Error updating cart:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update cart item" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const clearCart = async () => {
    if (!user) {
      // For guest users, clear localStorage
      dispatch({ type: "CLEAR_CART" })
      clearLocalStorageCart()
      return
    }

    // For logged-in users, clear database cart
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const response = await apiClearCart()
      if (response.success) {
        dispatch({ type: "CLEAR_CART" })
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to clear cart" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const getItemCount = (): number => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  // Load cart when user changes
  useEffect(() => {
    syncCart()
  }, [user, syncCart])

  return (
    <CartContext.Provider
      value={{
        cartItems: state.items,
        total: state.total,
        loading: state.loading,
        error: state.error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
