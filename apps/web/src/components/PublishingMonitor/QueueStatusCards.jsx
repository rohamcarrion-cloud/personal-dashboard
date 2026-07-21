import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import apiServerClient from '@/lib/apiServerClient.js';
import { Clock, Loader2, CheckCircle2, XCircle, RefreshCw, Ban } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: { label: 'Queued', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  processing: { label: 'Processing', icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/10', spin: true },
  published: { label: 'Published', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  retrying: { label: 'Retrying', icon: RefreshCw, color: 'text-indigo-500', bg: 'bg-indigo-500/10', spin: true },
  cancelled: { label: 'Cancelled', icon: Ban, color: 'text-slate-500', bg: 'bg-slate-500/10' }
};

export default function QueueStatusCards({ refreshKey, onFilterClick }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiServerClient.fetch('/publishing/queue-stats');
        if (!response.ok) throw new Error('Failed to fetch queue stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Queue stats error:', error);
        toast.error('Could not load queue statistics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = ['pending', 'processing', 'published', 'failed', 'retrying', 'cancelled'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((statusKey) => {
        const config = STATUS_CONFIG[statusKey];
        const count = stats[statusKey] || 0;
        const Icon = config.icon;
        
        return (
          <Card 
            key={statusKey} 
            className="border-none shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => onFilterClick && onFilterClick(statusKey)}
          >
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{config.label}</p>
                <div className={`p-2 rounded-xl ${config.bg} ${config.color}`}>
                  <Icon className={`w-4 h-4 ${config.spin ? 'animate-spin' : ''}`} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {count}
                </h3>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}