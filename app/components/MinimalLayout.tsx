"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { AuthProvider } from "../context/AuthContext"
import { CartProvider } from "../context/CartContext"

const inter = Inter({ subsets: ["latin"] })

interface MinimalLayoutProps {
  children: React.ReactNode
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  return (
    <div className={inter.className}>
      <AuthProvider>
        <CartProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </CartProvider>
      </AuthProvider>
    </div>
  )
}
