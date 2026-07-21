import apiServerClient from '@/lib/apiServerClient.js';

export async function getPlatformSettings() {
  try {
    const response = await apiServerClient.fetch('/platform/settings');
    if (!response.ok) {
      console.warn('Failed to fetch platform settings, falling back to defaults.');
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return null;
  }
}