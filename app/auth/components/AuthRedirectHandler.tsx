"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/AuthContext"

interface AuthRedirectHandlerProps {
  onRedirectPath: (path: string) => void
  children: (props: {
    router: ReturnType<typeof useRouter>
    auth: ReturnType<typeof useAuth>
    redirectPath: string
  }) => React.ReactNode
}

export default function AuthRedirectHandler({ onRedirectPath, children }: AuthRedirectHandlerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  
  const redirectPath = searchParams.get('redirect') || '/'
  
  // Notify parent component of the redirect path
  onRedirectPath(redirectPath)
  
  return children({ router, auth, redirectPath })
}
