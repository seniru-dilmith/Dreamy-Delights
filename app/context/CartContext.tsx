"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
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
} | null>(null)

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

  // Sync cart from database when user logs in
  const syncCart = async () => {
    if (!user) {
      dispatch({ type: "CLEAR_CART" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const response = await getCart()
      if (response.success && response.cart) {
        dispatch({ type: "LOAD_FROM_DATABASE", payload: response.cart.items })
      }
    } catch (error) {
      console.error("Error syncing cart:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to load cart" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const addToCart = async (item: CartItem) => {
    if (!user) {
      dispatch({ type: "SET_ERROR", payload: "Please log in to add items to cart" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

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
    if (!user) {
      dispatch({ type: "SET_ERROR", payload: "Please log in to modify cart" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

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
    if (!user) {
      dispatch({ type: "SET_ERROR", payload: "Please log in to modify cart" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

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
      dispatch({ type: "CLEAR_CART" })
      return
    }

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

  // Load cart when user changes
  useEffect(() => {
    syncCart()
  }, [user])

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
