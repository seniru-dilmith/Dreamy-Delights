"use client"

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ClientFooter() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Don't render footer on admin pages
  // (404 pages are handled by ConditionalLayout)
  if (isAdminPage) {
    return null;
  }
  
  // Render the footer on all other pages
  return <Footer />;
}
