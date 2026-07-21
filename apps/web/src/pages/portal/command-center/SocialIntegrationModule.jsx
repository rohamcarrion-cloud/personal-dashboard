import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Linkedin, Twitter, Facebook, Instagram, Video, PlaySquare, CheckCircle2, AlertCircle, XCircle, RefreshCw, Link2, Unlink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-[#0A66C2]' },
  { id: 'twitter', name: 'X/Twitter', icon: Twitter, color: 'text-foreground' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-[#1877F2]' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-[#E4405F]' },
  { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-foreground' },
  { id: 'youtube', name: 'YouTube Shorts', icon: PlaySquare, color: 'text-[#FF0000]' },
];

export default function SocialIntegrationModule() {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchAccounts();
    }
  }, [currentUser]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('social_accounts').getFullList({
        filter: `userId="${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setAccounts(records);
    } catch (error) {
      console.error('Failed to fetch social accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    setIsConnecting(true);
    try {
      let authUrl = '';
      
      // Try to get URL from backend
      try {
        const res = await apiServerClient.fetch('/linkedin/auth-url', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          authUrl = data.authorizationUrl;
        }
      } catch (e) {
        console.warn('Backend auth-url endpoint failed, falling back to local generation');
      }

      // Fallback to local generation if backend endpoint is missing
      if (!authUrl) {
        const clientId = '78sn8w3ihyel2u';
        const redirectUri = 'https://rohamcarrion.com/hcgi/platform/api/oauth2-redirect';
        const state = Math.random().toString(36).substring(7);
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=r_liteprofile%20r_emailaddress`;
      }

      // Open OAuth popup
      const popup = window.open(authUrl, 'linkedin_oauth', 'width=600,height=700');
      
      if (!popup) {
        toast.error('Popup blocked. Please allow popups for this site.');
        setIsConnecting(false);
        return;
      }

      // Poll for successful connection
      const pollInterval = setInterval(async () => {
        if (popup.closed) {
          clearInterval(pollInterval);
          setIsConnecting(false);
        }
        
        try {
          const records = await pb.collection('social_accounts').getList(1, 1, {
            filter: `platform="linkedin" && userId="${currentUser.id}" && isConnected=true`,
            sort: '-created',
            $autoCancel: false
          });
          
          if (records.items.length > 0) {
            clearInterval(pollInterval);
            popup.close();
            toast.success('LinkedIn account connected successfully');
            fetchAccounts();
            setIsConnecting(false);
          }
        } catch (err) {
          // Ignore polling errors
        }
      }, 2000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsConnecting(false);
      }, 300000);

    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate LinkedIn connection');
      setIsConnecting(false);
    }
  };

  const getAccountForPlatform = (platformId) => {
    return accounts.find(acc => acc.platform === platformId);
  };

  const getHealthBadge = (tokenStatus) => {
    switch (tokenStatus) {
      case 'valid':
      case 'connected':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"><CheckCircle2 className="w-3 h-3 mr-1"/> Healthy</Badge>;
      case 'expiring':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"><AlertCircle className="w-3 h-3 mr-1"/> Expiring Soon</Badge>;
      case 'expired':
      case 'revoked':
      case 'disconnected':
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"><XCircle className="w-3 h-3 mr-1"/> Action Required</Badge>;
      default:
        return null;
    }
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
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map(platform => {
            const account = getAccountForPlatform(platform.id);
            const isConnected = !!account;

            return (
              <Card key={platform.id} className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? 'bg-primary/10 ' + platform.color : 'bg-muted text-muted-foreground'}`}>
                        <platform.icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                    </div>
                    <Badge variant={isConnected ? 'default' : 'secondary'} className={isConnected ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0' : ''}>
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1">
                  {isConnected ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Account</p>
                        <p className="font-medium">{account.accountName}</p>
                        <p className="text-sm text-muted-foreground">@{account.username}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Connection Health</p>
                          {getHealthBadge(account.tokenStatus)}
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-xs text-muted-foreground">Last Used</p>
                          <p className="text-xs font-medium">
                            {account.lastUsed ? format(new Date(account.lastUsed), 'MMM d, yyyy') : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6 text-muted-foreground">
                      <Unlink className="w-8 h-8 mb-3 opacity-20" />
                      <p className="text-sm">Connect your {platform.name} account to enable direct publishing.</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-4 border-t border-border bg-muted/20 gap-2">
                  {isConnected ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <a href="/portal/command-center/connected-accounts">Manage Account</a>
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={platform.id === 'linkedin' ? handleConnectLinkedIn : undefined}
                      disabled={platform.id !== 'linkedin' || isConnecting}
                    >
                      <Link2 className="w-4 h-4 mr-2" /> 
                      {platform.id === 'linkedin' ? (isConnecting ? 'Connecting...' : 'Connect LinkedIn') : 'Coming Soon'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}