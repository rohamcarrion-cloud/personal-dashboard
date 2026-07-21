import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export default function TestConnectionButton({ service, onTest, isLoading }) {
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await apiServerClient.fetch(`/credentials/test/${service}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Connection test failed');
      }
      
      const data = await response.json();
      toast.success(`Connected to ${data.accountName || service}`);
      if (onTest) onTest(service, { status: 'connected', lastTested: new Date().toISOString(), ...data });
    } catch (error) {
      toast.error(error.message || `Failed to test connection for ${service}`);
      if (onTest) onTest(service, { status: 'error', errorMessage: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleTest} disabled={isLoading || isTesting}>
      {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
      Test
    </Button>
  );
}