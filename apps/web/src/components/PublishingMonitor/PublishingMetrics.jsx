import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import pb from '@/lib/pocketbaseClient.js';

export default function PublishingMetrics({ refreshKey }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch last 30 days of jobs for the chart
        const past30Days = new Date();
        past30Days.setDate(past30Days.getDate() - 30);
        const dateStr = past30Days.toISOString().split('T')[0];

        const jobs = await pb.collection('publishing_jobs').getFullList({
          filter: `created >= "${dateStr}"`,
          sort: 'created',
          $autoCancel: false
        });

        // Group by day
        const grouped = jobs.reduce((acc, job) => {
          const date = job.created.split(' ')[0];
          if (!acc[date]) acc[date] = { date, published: 0, failed: 0 };
          if (job.status === 'published') acc[date].published++;
          if (job.status === 'failed') acc[date].failed++;
          return acc;
        }, {});

        // Fill empty days
        const chartData = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          chartData.push({
            name: displayDate,
            published: grouped[dStr]?.published || 0,
            failed: grouped[dStr]?.failed || 0,
          });
        }

        setData(chartData);
      } catch (error) {
        console.error('Metrics fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, [refreshKey]);

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-2xl" />;
  }

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
        <CardTitle>Publishing Volume (30 Days)</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="published" 
                name="Successful"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPublished)" 
              />
              <Area 
                type="monotone" 
                dataKey="failed" 
                name="Failed"
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorFailed)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}