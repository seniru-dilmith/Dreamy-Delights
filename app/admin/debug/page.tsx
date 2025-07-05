"use client"

import { useState, useEffect } from "react";
import { useAdmin } from "@/app/context/AdminContext";
import { adminFetchProducts, getAdminToken } from "@/firebase/api";

export default function AdminDebug() {
  const { admin, isAuthenticated, loading } = useAdmin();
  const [products, setProducts] = useState<any[]>([]);
  const [apiResult, setApiResult] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check token
    const currentToken = getAdminToken();
    setToken(currentToken);
  }, []);

  const testProductsAPI = async () => {
    try {
      const result = await adminFetchProducts();
      setApiResult(result);
      if (result.success) {
        setProducts(result.data || []);
      }
    } catch (error) {
      console.error('🔧 Debug: Error testing products API:', error);
      setApiResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Debug Panel</h1>
      
      <div className="space-y-6">
        {/* Authentication Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Admin: {admin ? JSON.stringify(admin, null, 2) : 'None'}</p>
            <p>Token Available: {token ? 'Yes' : 'No'}</p>
            {token && (
              <p>Token Preview: {token.substring(0, 20)}...</p>
            )}
          </div>
        </div>

        {/* Products API Test */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Products API Test</h2>
          <button 
            onClick={testProductsAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            Test Products API
          </button>
          
          {apiResult && (
            <div className="mt-4">
              <h3 className="font-semibold">API Result:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          )}
          
          {products.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Products ({products.length}):</h3>
              <ul className="list-disc list-inside">
                {products.map((product, index) => (
                  <li key={product.id || index}>
                    {product.name} - ${product.price} ({product.category})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
