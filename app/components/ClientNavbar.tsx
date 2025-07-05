"use client"

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ClientNavbar() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Don't render navbar on admin pages
  // (404 pages are handled by ConditionalLayout)
  if (isAdminPage) {
    return null;
  }
  
  // Render the navbar on all other pages
  return <Navbar />;
}
