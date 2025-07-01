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
    if (!auth) {
      console.error("Firebase not available")
      return false
    }
    
    try {
      // Check if Google OAuth is configured
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      console.log("Google Client ID available:", !!googleClientId);
      
      if (!googleClientId || googleClientId.includes('your-')) {
        console.error("Google Client ID not configured properly");
        alert(`Google Sign-In setup required:

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add your domain to authorized origins
4. Update NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local

For now, please use email/password authentication.`);
        return false;
      }

      console.log("Starting Google Sign-In process...");

      // Load Google Identity Services script if not already loaded
      if (typeof window !== 'undefined' && !window.google) {
        console.log("Loading Google Identity Services script...");
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            console.log("Google Identity Services script loaded");
            resolve();
          };
          script.onerror = (error) => {
            console.error("Failed to load Google Identity Services script:", error);
            reject(new Error('Failed to load Google Sign-In'));
          };
          document.head.appendChild(script);
        });
      }

      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Initialize and perform Google Sign-In
      return new Promise<boolean>((resolve) => {
        if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
          console.error("Google Identity Services not properly initialized");
          alert("Google Sign-In is not available. Please try again or use email/password authentication.");
          resolve(false);
          return;
        }

        console.log("Initializing Google Sign-In...");
        
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: { credential: string }) => {
              try {
                console.log("Google Sign-In callback triggered");
                console.log("Credential received:", !!response.credential);
                
                // Send the ID token to our Firebase function
                console.log("Calling Firebase function...");
                const result = await authFunctions.loginWithGoogle({ idToken: response.credential });
                const data = result.data as any;
                
                console.log("Firebase function response:", data);
                
                if (data.success && data.customToken) {
                  console.log("Signing in with custom token...");
                  // Sign in with custom token
                  await signInWithCustomToken(auth, data.customToken);
                  console.log("Google Sign-In successful!");
                  resolve(true);
                } else {
                  console.error("Firebase function did not return success:", data);
                  alert("Google Sign-In failed on server. Please try again or use email/password authentication.");
                  resolve(false);
                }
              } catch (error) {
                console.error("Google login callback error:", error);
                alert("Google Sign-In failed. Please try again or use email/password authentication.");
                resolve(false);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Try One Tap first
          console.log("Attempting Google One Tap...");
          window.google.accounts.id.prompt((notification: any) => {
            console.log("One Tap notification:", notification);
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log("One Tap not displayed, user can try the Google button");
              alert("Google One Tap is not available. Please click the 'Continue with Google' button to sign in.");
              resolve(false);
            }
          });
        } catch (initError) {
          console.error("Error initializing Google Sign-In:", initError);
          alert("Failed to initialize Google Sign-In. Please try again or use email/password authentication.");
          resolve(false);
        }
      });
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google Sign-In is not available. Please use email/password authentication.");
      return false;
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

      console.log("Rendering Google Sign-In button...");

      // Load Google Identity Services script if not already loaded
      if (typeof window !== 'undefined' && !window.google) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            console.log("Google script loaded for button");
            resolve();
          };
          script.onerror = (error) => {
            console.error("Failed to load Google script for button:", error);
            reject(new Error('Failed to load Google Sign-In'));
          };
          document.head.appendChild(script);
        });
      }

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 500));

      if (typeof window !== 'undefined' && window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential: string }) => {
            try {
              console.log("Google button callback triggered");
              console.log("Button credential received:", !!response.credential);
              
              const result = await authFunctions.loginWithGoogle({ idToken: response.credential });
              const data = result.data as any;
              
              console.log("Button Firebase function response:", data);
              
              if (data.success && data.customToken) {
                await signInWithCustomToken(auth, data.customToken);
                console.log("Google button Sign-In successful!");
              } else {
                console.error("Google button sign-in failed:", data);
                alert("Google Sign-In failed. Please try again or use email/password authentication.");
              }
            } catch (error) {
              console.error("Google button callback error:", error);
              alert("Google Sign-In failed. Please try again or use email/password authentication.");
            }
          }
        });

        window.google.accounts.id.renderButton(element, {
          theme: "outline",
          size: "large"
        } as any);
        
        console.log("Google button rendered successfully");
      } else {
        console.error("Google accounts not available for button rendering");
      }
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
