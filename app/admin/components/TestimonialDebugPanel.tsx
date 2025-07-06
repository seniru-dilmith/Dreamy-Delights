"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  fetchTestimonials,
  createTestimonialAdmin,
  updateTestimonialAdmin,
  deleteTestimonialAdmin
} from "@/firebase/api";

export default function TestimonialDebugPanel() {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const log = (message: string) => {
    setOutput(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + message);
  };

  const clearLog = () => setOutput('');

  const testFetchTestimonials = async () => {
    setLoading(true);
    try {
      log('🔍 Testing fetch testimonials...');
      const response = await fetchTestimonials();
      log(`✅ Fetch successful: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      log(`❌ Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateTestimonial = async () => {
    setLoading(true);
    try {
      log('🆕 Testing create testimonial...');
      const testData = {
        name: 'Test Customer',
        text: 'This is a test testimonial created from the debug panel.',
        rating: 5,
        featured: true
      };
      log(`📝 Creating with data: ${JSON.stringify(testData, null, 2)}`);
      
      const response = await createTestimonialAdmin(testData);
      log(`✅ Create successful: ${JSON.stringify(response, null, 2)}`);
      
      // Store the ID for update/delete tests
      if (response.success && response.data) {
        (window as any).lastCreatedTestimonialId = response.data.id;
        log(`💾 Stored testimonial ID: ${response.data.id}`);
      }
    } catch (error) {
      log(`❌ Create failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateTestimonial = async () => {
    setLoading(true);
    try {
      const testimonialId = (window as any).lastCreatedTestimonialId;
      if (!testimonialId) {
        log('❌ No testimonial ID found. Create a testimonial first.');
        return;
      }

      log(`✏️ Testing update testimonial with ID: ${testimonialId}...`);
      const updateData = {
        text: 'This testimonial has been updated from the debug panel.',
        featured: false
      };
      log(`📝 Updating with data: ${JSON.stringify(updateData, null, 2)}`);
      
      const response = await updateTestimonialAdmin(testimonialId, updateData);
      log(`✅ Update successful: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      log(`❌ Update failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testDeleteTestimonial = async () => {
    setLoading(true);
    try {
      const testimonialId = (window as any).lastCreatedTestimonialId;
      if (!testimonialId) {
        log('❌ No testimonial ID found. Create a testimonial first.');
        return;
      }

      log(`🗑️ Testing delete testimonial with ID: ${testimonialId}...`);
      const response = await deleteTestimonialAdmin(testimonialId);
      log(`✅ Delete successful: ${JSON.stringify(response, null, 2)}`);
      
      // Clear the stored ID
      delete (window as any).lastCreatedTestimonialId;
      log('💾 Cleared stored testimonial ID');
    } catch (error) {
      log(`❌ Delete failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminToken = () => {
    try {
      const encryptedToken = localStorage.getItem('dreamy_admin_token');
      if (!encryptedToken) {
        log('❌ No admin token found in localStorage');
        return;
      }

      const { ClientEncryption } = require('@/utils/encryption');
      const tokenData = JSON.parse(ClientEncryption.decrypt(encryptedToken));
      
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        log('❌ Admin token has expired');
        return;
      }
      
      log('✅ Admin token found and valid');
      log(`📋 Token info: expires at ${new Date(tokenData.expiresAt).toLocaleString()}`);
      log(`🔑 Token preview: ${tokenData.token.substring(0, 20)}...`);
    } catch (error) {
      log(`❌ Error checking admin token: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testDirectAPICall = async () => {
    setLoading(true);
    try {
      log('🔧 Testing direct API call...');
      
      // Get token manually
      const encryptedToken = localStorage.getItem('dreamy_admin_token');
      if (!encryptedToken) {
        log('❌ No admin token found');
        return;
      }

      const { ClientEncryption } = require('@/utils/encryption');
      const tokenData = JSON.parse(ClientEncryption.decrypt(encryptedToken));
      
      log(`🔑 Using token: ${tokenData.token.substring(0, 20)}...`);
      
      // Test library testimonial API
      log('🧪 Testing testimonial creation via api utility');
      const result = await createTestimonialAdmin({
        name: 'Debug Testimonial',
        text: 'Debug panel testimonial creation.',
        rating: 5,
        featured: false
      });
      log(`📦 API result: ${JSON.stringify(result)}`);
      if (result.success) {
        log('✅ Testimonial created successfully via API');
      } else {
        log(`❌ API error: ${result.message}`);
      }
      
    } catch (error) {
      log(`❌ Direct API test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Testimonial API Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button 
              onClick={checkAdminToken}
              variant="outline"
              disabled={loading}
            >
              Check Token
            </Button>
            <Button 
              onClick={testDirectAPICall}
              variant="outline"
              disabled={loading}
            >
              Direct API Test
            </Button>
            <Button 
              onClick={testFetchTestimonials}
              variant="outline"
              disabled={loading}
            >
              Test Fetch
            </Button>
            <Button 
              onClick={testCreateTestimonial}
              variant="outline"
              disabled={loading}
            >
              Test Create
            </Button>
            <Button 
              onClick={testUpdateTestimonial}
              variant="outline"
              disabled={loading}
            >
              Test Update
            </Button>
            <Button 
              onClick={testDeleteTestimonial}
              variant="outline"
              disabled={loading}
            >
              Test Delete
            </Button>
            <Button 
              onClick={clearLog}
              variant="destructive"
              disabled={loading}
            >
              Clear Log
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Debug Output:</label>
            <Textarea 
              value={output}
              readOnly
              className="h-64 font-mono text-xs"
              placeholder="Debug output will appear here..."
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>First, click &ldquo;Check Token&rdquo; to verify your admin authentication</li>
              <li>Click &ldquo;Direct API Test&rdquo; to test authentication with the backend</li>
              <li>Click &ldquo;Test Fetch&rdquo; to test reading testimonials</li>
              <li>Click &ldquo;Test Create&rdquo; to create a test testimonial</li>
              <li>Click &ldquo;Test Update&rdquo; to update the created testimonial</li>
              <li>Click &ldquo;Test Delete&rdquo; to delete the test testimonial</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
