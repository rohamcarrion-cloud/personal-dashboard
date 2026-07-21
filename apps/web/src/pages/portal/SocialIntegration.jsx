import React, { useState, useEffect } from 'react';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import PlatformCard from '@/components/SocialIntegration/PlatformCard.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Linkedin, Twitter, Facebook, Instagram, Video, PlaySquare } from 'lucide-react';

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'x', name: 'X/Twitter', icon: Twitter },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'tiktok', name: 'TikTok', icon: Video },
  { id: 'youtube', name: 'YouTube Shorts', icon: PlaySquare },
];

export default function SocialIntegration() {
  const [accounts, setAccounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch('/social/accounts');
      if (response.ok) {
        const data = await response.json();
        // Expected format: { linkedin: { status: 'connected', accountName: '...', lastTested: '...' }, ... }
        setAccounts(data.accounts || {});
      }
    } catch (error) {
      console.error('Failed to fetch social accounts:', error);
      toast.error('Failed to load connected accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAccount = (platformId, data) => {
    setAccounts(prev => ({
      ...prev,
      [platformId]: { ...prev[platformId], ...data }
    }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Social Integration" 
        description="Connect and manage your social media accounts for automated publishing."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map(platform => {
            const accountData = accounts[platform.id] || { status: 'not-connected' };
            return (
              <PlatformCard
                key={platform.id}
                platform={platform.name}
                icon={platform.icon}
                status={accountData.status}
                accountName={accountData.accountName}
                lastTested={accountData.lastTested}
                onUpdate={(name, data) => handleUpdateAccount(platform.id, data)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}