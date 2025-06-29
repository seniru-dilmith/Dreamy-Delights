"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Admin Test Page</h1>
        <p className="text-gray-600">Use this page to test admin functionality</p>
        
        <div className="space-y-2">
          <div>
            <Link href="/admin/login">
              <Button variant="outline" className="w-48">
                Go to Admin Login
              </Button>
            </Link>
          </div>
          
          <div>
            <Link href="/admin/dashboard">
              <Button className="w-48 bg-purple-600 hover:bg-purple-700">
                Go to Admin Dashboard
              </Button>
            </Link>
          </div>
          
          <div>
            <Link href="/">
              <Button variant="outline" className="w-48">
                Go to Home Page
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Credentials:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
            <p className="text-xs text-gray-500">OR</p>
            <p><strong>Username:</strong> admin-dream</p>
            <p><strong>Password:</strong> Admin@Dream123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
