"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
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
  renderGoogleButton: (element: HTMLElement) => Promise<void>
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
    // For now, we'll skip custom claims to avoid IAM permission issues
    // All users will default to 'customer' role
    console.log("🔄 Converting Firebase user:", firebaseUser.email);
    console.log("📝 Defaulting to customer role to avoid IAM issues");
    
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email || '',
      role: "customer", // Always customer for now
      photoURL: firebaseUser.photoURL || undefined
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
    console.log("🚀 login called (using Firebase Auth directly)");
    
    if (!auth) {
      console.error("❌ Firebase not available")
      return false
    }
    
    try {
      console.log("🔧 Signing in with email and password...");
      
      // Use Firebase Auth directly for email/password login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log("✅ Email/password login successful!");
      console.log("👤 User info:", {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      });
      
      // Firebase Auth will automatically trigger onAuthStateChanged
      // which will update our user state
      return true;
      
    } catch (error) {
      console.error("💥 Email/password login error:", error);
      console.error("💥 Error details:", {
        message: (error as any)?.message || 'Unknown error',
        code: (error as any)?.code || 'No code',
      });
      
      // Handle specific error cases
      if ((error as any)?.code === 'auth/user-not-found') {
        console.log("ℹ️ User not found");
        return false;
      }
      
      if ((error as any)?.code === 'auth/wrong-password') {
        console.log("ℹ️ Wrong password");
        return false;
      }
      
      if ((error as any)?.code === 'auth/invalid-email') {
        console.log("ℹ️ Invalid email");
        return false;
      }
      
      return false;
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    console.log("🚀 loginWithGoogle called (using Firebase Auth directly)");
    
    if (!auth) {
      console.error("❌ Firebase not available")
      return false
    }
    
    try {
      // Check if Google OAuth is configured
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      console.log("🔑 Google Client ID:", googleClientId ? "SET" : "NOT SET");
      
      if (!googleClientId || googleClientId.includes('your-')) {
        console.error("❌ Google Client ID not configured properly:", googleClientId);
        alert(`Google Sign-In setup required:

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials  
3. Add your domain to authorized origins
4. Update NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local

For now, please use email/password authentication.`);
        return false;
      }

      console.log("✅ Google Client ID configured properly");

      // Use Firebase Auth Google provider directly
      console.log("🔧 Setting up Google Auth Provider...");
      const provider = new GoogleAuthProvider();
      
      // Optional: Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log("🚀 Starting Google Sign-In popup...");
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      
      console.log("✅ Google Sign-In successful!");
      console.log("👤 User info:", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      });
      
      // Firebase Auth will automatically trigger onAuthStateChanged
      // which will update our user state
      return true;
      
    } catch (error) {
      console.error("💥 Google login error:", error);
      console.error("💥 Error details:", {
        message: (error as any)?.message || 'Unknown error',
        code: (error as any)?.code || 'No code',
      });
      
      // Handle specific error cases
      if ((error as any)?.code === 'auth/popup-closed-by-user') {
        console.log("ℹ️ User closed the popup");
        return false;
      }
      
      if ((error as any)?.code === 'auth/popup-blocked') {
        alert("Popup was blocked by your browser. Please allow popups for this site and try again.");
        return false;
      }
      
      alert("Google Sign-In failed. Please try again or use email/password authentication.");
      return false;
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    console.log("🚀 register called (using Firebase Auth directly)");
    
    if (!auth) {
      console.error("❌ Firebase not available")
      return false
    }
    
    try {
      console.log("🔧 Creating user with email and password...");
      
      // Use Firebase Auth directly for email/password registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log("✅ User created successfully!");
      console.log("👤 User info:", {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      });
      
      // Update the user's display name
      if (name) {
        console.log("🔧 Updating user profile with display name...");
        await updateProfile(userCredential.user, {
          displayName: name
        });
        console.log("✅ User profile updated!");
      }
      
      // Firebase Auth will automatically trigger onAuthStateChanged
      // which will update our user state
      return true;
      
    } catch (error) {
      console.error("💥 Registration error:", error);
      console.error("💥 Error details:", {
        message: (error as any)?.message || 'Unknown error',
        code: (error as any)?.code || 'No code',
      });
      
      // Handle specific error cases
      if ((error as any)?.code === 'auth/email-already-in-use') {
        console.log("ℹ️ Email already in use");
        return false;
      }
      
      if ((error as any)?.code === 'auth/weak-password') {
        console.log("ℹ️ Password is too weak");
        return false;
      }
      
      if ((error as any)?.code === 'auth/invalid-email') {
        console.log("ℹ️ Invalid email");
        return false;
      }
      
      return false;
    }
  }

  const logout = async (): Promise<void> => {
    console.log("🚀 logout called (using Firebase Auth directly)");
    
    try {
      if (auth) {
        console.log("🔧 Signing out...");
        await signOut(auth);
        console.log("✅ Signed out successfully!");
      }
      setUser(null);
    } catch (error) {
      console.error("💥 Logout error:", error);
      // Force local logout even if signOut fails
      setUser(null);
    }
  }

  const renderGoogleButton = async (element: HTMLElement): Promise<void> => {
    if (!auth) {
      console.error("Firebase not available")
      return
    }
    
    try {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!googleClientId || googleClientId.includes('your-')) {
        console.error("Google Client ID not configured for button rendering");
        return
      }

      console.log("🎯 Creating Google Sign-In button that uses Firebase Auth directly...");

      // Create a button element that triggers our loginWithGoogle function
      const button = document.createElement('button');
      
      // Create the Google SVG icon
      const googleSvg = `
        <svg class="w-5 h-5" viewBox="0 0 24 24" style="width: 20px; height: 20px; margin-right: 8px;">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      `;
      
      button.innerHTML = `${googleSvg}Sign in with Google`;
      button.className = 'google-signin-button';
      button.style.cssText = `
        background: white;
        color: #757575;
        border: 1px solid #dadce0;
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 200px;
        transition: all 0.2s ease;
        font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
      `;
      
      // Add hover effects
      button.onmouseenter = () => {
        button.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)';
        button.style.backgroundColor = '#f8f9fa';
      };
      
      button.onmouseleave = () => {
        button.style.boxShadow = 'none';
        button.style.backgroundColor = 'white';
      };
      
      button.onclick = async () => {
        console.log("🖱️ Google button clicked - calling loginWithGoogle...");
        await loginWithGoogle();
      };

      // Replace the element's content with our button
      element.innerHTML = '';
      element.appendChild(button);
      
      console.log("✅ Google button rendered successfully");
    } catch (error) {
      console.error("Error rendering Google button:", error);
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        loginWithGoogle, 
        renderGoogleButton,
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
