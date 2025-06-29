import type React from "react"
import { AdminProvider } from "@/app/context/AdminContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  )
}
