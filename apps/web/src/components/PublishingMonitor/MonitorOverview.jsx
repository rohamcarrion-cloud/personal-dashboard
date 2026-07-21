import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock, CheckCircle2, AlertCircle, RefreshCcw, Activity, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MonitorOverview({ metrics, lastUpdated }) {
  const cards = [
    { label: 'Queued Jobs', value: metrics?.queued || 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Processing', value: metrics?.processing || 0, icon: RefreshCcw, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Published (Today)', value: metrics?.published || 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Failed', value: metrics?.failed || 0, icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Retrying', value: metrics?.retrying || 0, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">System Status</h2>
        <span className="text-xs text-muted-foreground flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
          Last updated: {lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : 'Just now'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <Card key={i} className="p-4 border-border shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <div className={`p-1.5 rounded-md ${c.bg}`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold">{c.value}</span>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="p-4 flex items-center justify-between bg-muted/20">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Average Publish Time</p>
            <p className="text-xl font-semibold">{metrics?.avgTime || '1.2s'}</p>
          </div>
          <Activity className="w-8 h-8 text-muted-foreground/30" />
        </Card>
        <Card className="p-4 flex items-center justify-between bg-muted/20">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Platform Error Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold">{metrics?.failureRate || '0.5%'}</p>
              <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20"><ArrowUpRight className="w-3 h-3 mr-1" /> Healthy</Badge>
            </div>
          </div>
          <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
        </Card>
      </div>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';