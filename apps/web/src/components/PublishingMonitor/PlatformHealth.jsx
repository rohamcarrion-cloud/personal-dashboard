import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { Linkedin, Twitter, Facebook, Instagram, Video, PlaySquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PLATFORM_CONFIG = {
  linkedin: { name: 'LinkedIn', icon: Linkedin },
  x: { name: 'X / Twitter', icon: Twitter },
  facebook: { name: 'Facebook', icon: Facebook },
  instagram: { name: 'Instagram', icon: Instagram },
  tiktok: { name: 'TikTok', icon: Video },
  youtube: { name: 'YouTube', icon: PlaySquare }
};

export default function PlatformHealth({ refreshKey }) {
  const [healthData, setHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const accounts = await pb.collection('social_accounts').getFullList({
          $autoCancel: false,
          sort: '-updated'
        });

        // In a real app, you might correlate this with recent jobs to calculate failure rate.
        // Mocking some aggregated health metrics based on connection status for visual completeness
        const aggregated = Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
          const platformAccounts = accounts.filter(a => a.platform === key);
          const activeCount = platformAccounts.filter(a => a.status === 'active' || a.status === 'connected').length;
          const errorCount = platformAccounts.filter(a => a.status === 'error').length;
          
          let healthStatus = 'Healthy';
          if (errorCount > 0) healthStatus = 'Error';
          else if (platformAccounts.length === 0) healthStatus = 'Warning';

          return {
            id: key,
            ...config,
            healthStatus,
            accountsCount: platformAccounts.length,
            activeCount,
            lastTested: platformAccounts[0]?.updated || null
          };
        });

        setHealthData(aggregated);
      } catch (error) {
        console.error('Health fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHealth();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {healthData.map((platform) => {
        const Icon = platform.icon;
        const isHealthy = platform.healthStatus === 'Healthy';
        const isError = platform.healthStatus === 'Error';

        return (
          <Card key={platform.id} className="border-border/50 shadow-sm overflow-hidden group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <CardTitle className="text-base font-semibold">{platform.name}</CardTitle>
              </div>
              <Badge 
                variant={isHealthy ? 'default' : isError ? 'destructive' : 'secondary'}
                className={isHealthy ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20' : ''}
              >
                {isHealthy ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                {platform.healthStatus}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 pb-5 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Connected Accounts</p>
                <p className="text-2xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {platform.activeCount} <span className="text-sm font-normal text-muted-foreground">/ {platform.accountsCount}</span>
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground">Last Checked</p>
                <p className="text-sm font-medium">
                  {platform.lastTested ? formatDistanceToNow(new Date(platform.lastTested), { addSuffix: true }) : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}