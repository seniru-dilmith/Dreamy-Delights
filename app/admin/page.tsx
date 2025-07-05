"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login page
    router.push("/admin/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <p className="text-lg text-gray-600">Redirecting to admin login...</p>
      </div>
    </div>
  );
}
