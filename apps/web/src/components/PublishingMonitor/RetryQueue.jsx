import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import apiServerClient from '@/lib/apiServerClient.js';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function RetryQueue({ refreshKey }) {
  const [failedJobs, setFailedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFailedJobs();
  }, [refreshKey]);

  const fetchFailedJobs = async () => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch('/publishing/jobs?status=failed&limit=20');
      if (!response.ok) throw new Error('Failed to fetch retries');
      const data = await response.json();
      setFailedJobs(data.items || []);
    } catch (error) {
      console.error('Retry queue fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryAll = async () => {
    let successCount = 0;
    for (const job of failedJobs) {
      try {
        await apiServerClient.fetch('/publishing/retry-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id })
        });
        successCount++;
      } catch (err) {
        // Continue
      }
    }
    toast.success(`Queued ${successCount} jobs for retry.`);
    fetchFailedJobs();
  };

  if (isLoading) {
    return (
      <Card className="border-rose-200/50 shadow-sm h-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (failedJobs.length === 0) {
    return null; // Hide completely if no failures to focus attention on active tasks
  }

  return (
    <Card className="border-rose-200 shadow-sm bg-rose-50/30 dark:bg-rose-950/10 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-rose-100 dark:border-rose-900/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> 
            Action Required
          </CardTitle>
          <CardDescription className="text-rose-600/70 dark:text-rose-400/70">
            {failedJobs.length} {failedJobs.length === 1 ? 'job' : 'jobs'} failed to publish
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRetryAll} className="text-rose-600 hover:text-rose-700 hover:bg-rose-100">
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry All
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-auto flex-1 custom-scrollbar max-h-[300px]">
        <div className="divide-y divide-rose-100 dark:divide-rose-900/30">
          {failedJobs.map(job => (
            <div key={job.id} className="p-4 hover:bg-rose-100/50 dark:hover:bg-rose-900/20 transition-colors group flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-700/80 dark:text-rose-400/80">
                    {job.platform}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(job.updated), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium truncate mb-1">
                  {job.errorMessage || 'Unknown API Error'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Attempt {job.retryCount || 0} of 3
                </p>
              </div>
              <Button size="icon" variant="ghost" className="shrink-0 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                await apiServerClient.fetch('/publishing/retry-job', {
                  method: 'POST',
                  body: JSON.stringify({ jobId: job.id })
                });
                fetchFailedJobs();
              }}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}