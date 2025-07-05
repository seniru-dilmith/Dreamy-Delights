'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ClientNavbar from './ClientNavbar'
import ClientFooter from './ClientFooter'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const [is404, setIs404] = useState(false)
  
  useEffect(() => {
    // Check if this is a 404 page based on document or known routes
    const checkIs404 = () => {
      // Method 1: Check if pathname indicates not-found
      if (pathname.includes('not-found') || pathname.includes('_not-found')) {
        return true
      }
      
      // Method 2: Check known routes
      const knownRoutes = ['/', '/menu', '/about', '/contact', '/cart', '/checkout']
      const cleanPath = pathname?.replace(/\/$/, '') || '/'
      
      // If it's not a known route and not admin/auth, it's likely 404
      const isKnownRoute = knownRoutes.includes(cleanPath) || 
                          pathname?.startsWith('/admin') ||
                          pathname?.startsWith('/auth')
      
      return !isKnownRoute
    }
    
    setIs404(checkIs404())
  }, [pathname])
  
  // Hide navbar and footer on 404 page
  if (is404) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <>
      <ClientNavbar />
      <main>{children}</main>
      <ClientFooter />
    </>
  )
}
