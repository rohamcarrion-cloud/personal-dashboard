import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Activity, CheckCircle2, AlertOctagon, RefreshCcw, BarChart3 } from 'lucide-react';

export default function MonitorDashboard({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  const pending = stats.filter(j => j.status === 'pending').length;
  const processing = stats.filter(j => j.status === 'processing').length;
  const published = stats.filter(j => j.status === 'published').length;
  const failed = stats.filter(j => j.status === 'failed').length;
  const retrying = stats.filter(j => j.status === 'retrying').length;

  const platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube'];
  
  const platformHealth = platforms.map(platform => {
    const platformJobs = stats.filter(j => j.platform === platform);
    const platPublished = platformJobs.filter(j => j.status === 'published').length;
    const platFailed = platformJobs.filter(j => j.status === 'failed').length;
    const totalFinished = platPublished + platFailed;
    const successRate = totalFinished > 0 ? Math.round((platPublished / totalFinished) * 100) : null;
    
    return {
      platform,
      total: platformJobs.length,
      successRate,
      platPublished,
      platFailed
    };
  });

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="shadow-sm border-border">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Queued
            </p>
            <p className="text-3xl font-bold mt-3">{pending}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-primary/5">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              <Activity className="w-4 h-4" /> Processing
            </p>
            <p className="text-3xl font-bold mt-3 text-primary">{processing}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-green-500/5">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <p className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Published
            </p>
            <p className="text-3xl font-bold mt-3 text-green-600">{published}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-destructive/5">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <p className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" /> Failed
            </p>
            <p className="text-3xl font-bold mt-3 text-destructive">{failed}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-amber-500/5">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" /> Retrying
            </p>
            <p className="text-3xl font-bold mt-3 text-amber-600">{retrying}</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Platform Health (Success Rates)</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {platformHealth.map(ph => (
              <div key={ph.platform} className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{ph.platform}</span>
                {ph.successRate !== null ? (
                  <div className="flex flex-col items-center">
                    <span className={`text-2xl font-bold ${ph.successRate >= 90 ? 'text-green-500' : ph.successRate >= 70 ? 'text-amber-500' : 'text-destructive'}`}>
                      {ph.successRate}%
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">{ph.platPublished} ok / {ph.platFailed} fail</span>
                  </div>
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">N/A</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}