"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "../../context/AuthContext"
import AuthRedirectHandler from "../components/AuthRedirectHandler"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [redirectPath, setRedirectPath] = useState("/")
  const googleButtonRef = useRef<HTMLDivElement>(null)

  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthRedirectHandler onRedirectPath={setRedirectPath}>
        {({ router, auth }) => (
          <RegisterForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
            router={router}
            auth={auth}
            redirectPath={redirectPath}
            googleButtonRef={googleButtonRef}
          />
        )}
      </AuthRedirectHandler>
    </Suspense>
  )
}

interface RegisterFormProps {
  name: string
  setName: (name: string) => void
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string
  setError: (error: string) => void
  router: ReturnType<typeof useRouter>
  auth: ReturnType<typeof useAuth>
  redirectPath: string
  googleButtonRef: React.RefObject<HTMLDivElement | null>
}

function RegisterForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  loading,
  setLoading,
  error,
  setError,
  router,
  auth,
  redirectPath,
  googleButtonRef
}: RegisterFormProps) {
  const { register, loginWithGoogle, renderGoogleButton, user, loading: authLoading } = auth

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      console.log("🔄 User is authenticated, redirecting to home page");
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Initialize Google button
  useEffect(() => {
    if (googleButtonRef.current) {
      renderGoogleButton(googleButtonRef.current);
    }
  }, [renderGoogleButton]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("🚀 handleSubmit (register) called with:", { name, email });

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      console.log("🔄 Calling register function...");
      const success = await register(name, email, password)
      console.log("📋 Register result:", success);
      
      if (success) {
        console.log("✅ Registration successful, attempting redirect to /");
        router.push('/')
        console.log("🔄 Router.push called");
      } else {
        console.log("❌ Registration failed");
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("💥 Registration error in handleSubmit:", err);
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
      console.log("🏁 Registration process finished");
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const success = await loginWithGoogle()
      if (success) {
        router.push('/')
      } else {
        setError("Google registration failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred with Google registration.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-4"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <p className="text-gray-600">Join Dreamy Delights today</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

                <div className="flex justify-center items-center mt-4">
                {/* Google Identity Services button will be rendered here */}
                <div ref={googleButtonRef} className="flex justify-center" />
                </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-pink-600 hover:text-pink-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
