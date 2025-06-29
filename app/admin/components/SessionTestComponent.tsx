"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/app/context/AdminContext";

export default function SessionTestComponent() {
  const { admin, isAuthenticated, loading } = useAdmin();
  const [sessionInfo, setSessionInfo] = useState<any>({});

  const refreshSessionInfo = () => {
    const encryptedToken = localStorage.getItem('dreamy_admin_token');
    const info: any = {
      timestamp: new Date().toLocaleTimeString(),
      isAuthenticated,
      adminUsername: admin?.username,
      adminRole: admin?.role,
      hasEncryptedToken: !!encryptedToken,
      loading
    };

    if (encryptedToken) {
      try {
        const { ClientEncryption } = require('@/utils/encryption');
        const tokenData = JSON.parse(ClientEncryption.decrypt(encryptedToken));
        
        info.tokenAge = Date.now() - tokenData.timestamp;
        info.tokenStoredAt = new Date(tokenData.timestamp).toLocaleString();
        
        // Decode JWT
        const tokenParts = tokenData.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          info.jwtExpiresAt = new Date(payload.exp * 1000).toLocaleString();
          info.jwtIsExpired = payload.exp * 1000 < Date.now();
          info.jwtUsername = payload.username;
        }
      } catch (error) {
        info.decryptError = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    
    setSessionInfo(info);
    console.log('Session Info:', info);
  };

  useEffect(() => {
    refreshSessionInfo();
  }, [admin, isAuthenticated, loading]);

  const testRefresh = () => {
    console.log('Testing page refresh...');
    window.location.reload();
  };

  const clearSession = () => {
    localStorage.removeItem('dreamy_admin_token');
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🧪 Admin Session Persistence Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={refreshSessionInfo}>Refresh Info</Button>
          <Button onClick={testRefresh} variant="outline">Test Page Refresh</Button>
        </div>
        
        <Button onClick={clearSession} variant="destructive" className="w-full">
          Clear Session & Refresh
        </Button>
        
        <div className="bg-gray-100 p-4 rounded text-sm">
          <h3 className="font-semibold mb-2">Current Session Status:</h3>
          <pre className="whitespace-pre-wrap text-xs">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-blue-50 p-4 rounded text-sm">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Login to admin panel</li>
            <li>Navigate to this debug tab</li>
            <li>Click "Test Page Refresh" button</li>
            <li>Verify you remain logged in</li>
            <li>Check that session info shows valid token</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
