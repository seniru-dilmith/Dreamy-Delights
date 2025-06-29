"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/app/context/AdminContext";
import { 
  adminLogin,
  setAdminToken,
  adminCreateProduct,
  adminFetchProducts 
} from "@/firebase/api";
import SessionTestComponent from "./SessionTestComponent";

export default function AdminDebugPanel() {
  const { admin, login, logout, isAuthenticated, loading } = useAdmin();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectLogin = async () => {
    try {
      addTestResult("Testing direct admin login...");
      const result = await adminLogin({
        username: 'admin',
        password: 'admin123'
      });
      addTestResult(`Direct login result: ${JSON.stringify(result)}`);
    } catch (error) {
      addTestResult(`Direct login error: ${error}`);
    }
  };

  const testTokenStorage = () => {
    try {
      addTestResult("Testing token storage...");
      
      // Test setting a token
      const testToken = "test-token-123";
      setAdminToken(testToken);
      addTestResult("Token set successfully");
      
      // Check localStorage directly
      const stored = localStorage.getItem('dreamy_admin_token');
      addTestResult(`Stored in localStorage: ${stored ? 'Yes' : 'No'}`);
      
      // Clear the test token
      setAdminToken(null);
      addTestResult("Test token cleared");
    } catch (error) {
      addTestResult(`Token storage error: ${error}`);
    }
  };

  const testProductCreation = async () => {
    try {
      addTestResult("Testing product creation...");
      
      const formData = new FormData();
      formData.append('name', 'Debug Test Product');
      formData.append('description', 'Test product from debug panel');
      formData.append('price', '19.99');
      formData.append('category', 'Desserts');
      formData.append('stock', '5');
      formData.append('featured', 'false');
      formData.append('active', 'true');
      
      const result = await adminCreateProduct(formData);
      addTestResult(`Product creation result: ${JSON.stringify(result)}`);
    } catch (error) {
      addTestResult(`Product creation error: ${error}`);
    }
  };

  const testProductFetch = async () => {
    try {
      addTestResult("Testing product fetch...");
      const result = await adminFetchProducts();
      addTestResult(`Product fetch result: ${result.success ? 'Success' : 'Failed'}`);
      addTestResult(`Products count: ${result.data?.length || 0}`);
    } catch (error) {
      addTestResult(`Product fetch error: ${error}`);
    }
  };

  const checkDebugInfo = () => {
    const info = {
      isAuthenticated,
      adminData: admin,
      loading,
      localStorageToken: localStorage.getItem('dreamy_admin_token'),
      windowDefined: typeof window !== 'undefined'
    };
    setDebugInfo(info);
    addTestResult(`Debug info updated: ${JSON.stringify(info, null, 2)}`);
  };

  useEffect(() => {
    checkDebugInfo();
  }, [admin, isAuthenticated, loading]);

  return (
    <div className="p-6 space-y-6">
      <SessionTestComponent />
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Authentication Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testDirectLogin}>Test Direct Login</Button>
            <Button onClick={testTokenStorage}>Test Token Storage</Button>
            <Button onClick={testProductCreation}>Test Product Creation</Button>
            <Button onClick={testProductFetch}>Test Product Fetch</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={checkDebugInfo}>Refresh Debug Info</Button>
            <Button onClick={() => setTestResults([])}>Clear Results</Button>
          </div>
          
          {admin && (
            <div className="flex gap-4">
              <Button onClick={logout} variant="destructive">Logout</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
