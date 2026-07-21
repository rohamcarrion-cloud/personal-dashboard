import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export const connectToOAuth = async (platform) => {
  try {
    const response = await apiServerClient.fetch(`/social/oauth/authorize/${platform}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to initiate connection');
    }
    
    const data = await response.json();
    
    if (data.url) {
      // Redirect to OAuth provider
      window.location.href = data.url;
    } else {
      toast.error('No authorization URL returned from server.');
    }
  } catch (error) {
    console.error('OAuth connection error:', error);
    toast.error(error.message || `Failed to connect to ${platform}`);
    throw error;
  }
};

export default function OAuthConnector() {
  return null; // Utility component/file
}