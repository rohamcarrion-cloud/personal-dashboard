import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export const testConnection = async (platform) => {
  try {
    const response = await apiServerClient.fetch(`/social/test-connection/${platform}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Connection test failed');
    }
    
    const data = await response.json();
    toast.success(`Successfully connected to ${data.accountName || platform}`);
    return data;
  } catch (error) {
    console.error('Test connection error:', error);
    toast.error(error.message || `Failed to test connection for ${platform}`);
    throw error;
  }
};

export default function TestConnection() {
  return null; // Utility file
}