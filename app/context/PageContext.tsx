"use client"

import { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  isNotFoundPage: boolean;
  setIsNotFoundPage: (value: boolean) => void;
}

const PageContext = createContext<PageContextType>({
  isNotFoundPage: false,
  setIsNotFoundPage: () => {},
});

export function PageProvider({ children }: { children: ReactNode }) {
  const [isNotFoundPage, setIsNotFoundPage] = useState(false);

  return (
    <PageContext.Provider value={{ isNotFoundPage, setIsNotFoundPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  if (!context) {
    // Return default values if context is not available (e.g., during SSR)
    return {
      isNotFoundPage: false,
      setIsNotFoundPage: () => {},
    };
  }
  return context;
}
