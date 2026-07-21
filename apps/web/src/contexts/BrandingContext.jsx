import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPlatformSettings } from '@/utils/platformSettings.js';

const BrandingContext = createContext(null);

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    setLoading(true);
    try {
      const data = await getPlatformSettings();
      if (data) {
        setBranding(data);
        
        // Dynamically update favicon if provided
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.faviconUrl;
        }
      }
    } catch (error) {
      console.error("Failed to load branding context:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};