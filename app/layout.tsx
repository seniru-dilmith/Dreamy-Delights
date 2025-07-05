import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ConditionalLayout from "./components/ConditionalLayout"
import { CartProvider } from "./context/CartContext"
import { AuthProvider } from "./context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dreamy Delights Bakery - Fresh Cakes & Cupcakes",
  description:
    "Order fresh, delicious cakes and cupcakes from Dreamy Delights Bakery. Custom orders available with delivery.",
  keywords: "bakery, cakes, cupcakes, custom orders, fresh baked goods",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/favicon-32x32.png",
        sizes: "32x32",
      },
      {
        rel: "icon",
        url: "/favicon-16x16.png",
        sizes: "16x16",
      },
    ],
  },
  openGraph: {
    title: "Dreamy Delights Bakery",
    description:
      "Order fresh, delicious cakes and cupcakes from Dreamy Delights Bakery. Custom orders available with delivery.",
    url: "https://dreamydelights.com",
    siteName: "Dreamy Delights Bakery",
    images: [
      {
        url: "https://dreamydelights.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dreamy Delights Bakery - Fresh Cakes & Cupcakes",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dreamy Delights Bakery",
    description: "Order fresh, delicious cakes and cupcakes from Dreamy Delights Bakery. Custom orders available with delivery.",
    images: ["https://dreamydelights.com/twitter-image.jpg"],
    creator: "@dreamydelights",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  appleWebApp: {
    capable: true,
    title: "Dreamy Delights Bakery",
    statusBarStyle: "default",
  },
  alternates: {
    canonical: "https://dreamydelights.com",
    languages: {
      "en-US": "/en",
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
  formatDetection: {
    telephone: false, // Disable automatic phone number detection
    address: false, // Disable automatic address detection
    email: false, // Disable automatic email detection
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
