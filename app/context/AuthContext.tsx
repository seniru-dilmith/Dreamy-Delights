"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User as FirebaseUser } from "firebase/auth"
import { authFunctions, auth, signInWithCustomToken, signOut, onAuthStateChanged, isFirebaseReady } from "@/firebase/init"

interface User {
  id: string
  name: string
  email: string
  role: "customer" | "admin"
  photoURL?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  loginWithFacebook: () => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  isFirebaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isFirebaseConfigured = isFirebaseReady()

  // Convert Firebase user to our User type
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    // Get user role from custom claims instead of hardcoded email
    try {
      const idTokenResult = await firebaseUser.getIdTokenResult()
      const role = idTokenResult.claims.role || 'customer'
      
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        role: role as "customer" | "admin",
        photoURL: firebaseUser.photoURL || undefined
      }
    } catch (error) {
      console.error("Error getting user claims:", error)
      // Fallback to customer role if we can't get claims
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        role: "customer",
        photoURL: firebaseUser.photoURL || undefined
      }
    }
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await convertFirebaseUser(firebaseUser)
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!auth) {
      console.error("Firebase not available")
      return false
    }
    
    try {
      const result = await authFunctions.loginWithEmail({ email, password })
      const data = result.data as any
      
      if (data.success && data.customToken) {
        // Sign in with custom token
        await signInWithCustomToken(auth, data.customToken)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // In a real implementation, you would get the Google ID token from Google Sign-In
      // For now, this is a placeholder
      console.log("Google login would be implemented here")
      return false
    } catch (error) {
      console.error("Google login error:", error)
      return false
    }
  }

  const loginWithFacebook = async (): Promise<boolean> => {
    try {
      // In a real implementation, you would get the Facebook access token
      // For now, this is a placeholder
      console.log("Facebook login would be implemented here")
      return false
    } catch (error) {
      console.error("Facebook login error:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    if (!auth) {
      console.error("Firebase not available")
      return false
    }
    
    try {
      const result = await authFunctions.registerWithEmail({ 
        email, 
        password, 
        displayName: name 
      })
      const data = result.data as any
      
      if (data.success && data.customToken) {
        // Sign in with custom token
        await signInWithCustomToken(auth, data.customToken)
        return true
      }
      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Call backend logout to revoke tokens (if available)
      if (auth) {
        await authFunctions.logout({})
        // Sign out on client
        await signOut(auth)
      }
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      // Force local logout even if backend call fails
      if (auth) {
        await signOut(auth)
      }
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        loginWithGoogle, 
        loginWithFacebook, 
        register, 
        logout, 
        loading, 
        isFirebaseConfigured: true // Always true since we use minimal config
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
