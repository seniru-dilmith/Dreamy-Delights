"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function AuthTest() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [name, setName] = useState("Test User")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const googleButtonRef = useRef<HTMLDivElement>(null)

  const { user, login, loginWithGoogle, renderGoogleButton, register, logout } = useAuth()

  // Initialize Google button
  useEffect(() => {
    if (googleButtonRef.current) {
      renderGoogleButton(googleButtonRef.current);
    }
  }, [renderGoogleButton]);

  const handleLogin = async () => {
    setLoading(true)
    setMessage("")
    try {
      const success = await login(email, password)
      setMessage(success ? "Login successful!" : "Login failed")
    } catch (error) {
      setMessage(`Login error: ${error}`)
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true)
    setMessage("")
    try {
      const success = await register(name, email, password)
      setMessage(success ? "Registration successful!" : "Registration failed")
    } catch (error) {
      setMessage(`Registration error: ${error}`)
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage("")
    try {
      const success = await loginWithGoogle()
      setMessage(success ? "Google login successful!" : "Google login failed")
    } catch (error) {
      setMessage(`Google login error: ${error}`)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setMessage("Logged out successfully!")
    } catch (error) {
      setMessage(`Logout error: ${error}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-medium text-green-800">Logged in as:</h3>
                <p className="text-green-700">Name: {user.name}</p>
                <p className="text-green-700">Email: {user.email}</p>
                <p className="text-green-700">Role: {user.role}</p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleLogin} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Loading..." : "Login"}
                </Button>
                <Button 
                  onClick={handleRegister} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? "Loading..." : "Register"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Google Identity Services button will be rendered here */}
                <div ref={googleButtonRef} className="w-full"></div>
                
                <Button 
                  onClick={handleGoogleLogin} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Google (Manual)
                </Button>
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded border ${
              message.includes('successful') 
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
