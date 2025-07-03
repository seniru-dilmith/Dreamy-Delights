"use client"

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ClientFooter() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Don't render footer on admin pages
  if (isAdminPage) {
    return null;
  }
  
  // Render the footer on all other pages
  return <Footer />;
}
