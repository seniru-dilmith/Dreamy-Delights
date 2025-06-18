import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { CartProvider } from "./context/CartContext"
import { AuthProvider } from "./context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dreamy Delights Bakery - Fresh Cakes & Cupcakes",
  description:
    "Order fresh, delicious cakes and cupcakes from Dreamy Delights Bakery. Custom orders available with delivery.",
  keywords: "bakery, cakes, cupcakes, custom orders, fresh baked goods",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
