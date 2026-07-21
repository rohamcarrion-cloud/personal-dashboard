import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Download, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { checkRouteHealth } from '@/utils/routeHealthCheck.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CACHE_KEY = 'routeHealthCache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function RouteHealthSection() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const runCheck = async (force = false) => {
    setLoading(true);
    try {
      if (!force) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setResults(data);
            setLastChecked(new Date(timestamp));
            setLoading(false);
            return;
          }
        }
      }

      const data = await checkRouteHealth();
      setResults(data);
      const now = new Date();
      setLastChecked(now);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: now.getTime() }));
      if (force) toast.success('Route health check completed');
    } catch (error) {
      toast.error('Failed to run route health check');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const exportReport = () => {
    const csv = [
      ['Route', 'Status', 'Load Time (ms)', 'Error'],
      ...results.map(r => [r.route, r.status, r.loadTime, r.error || ''])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route-health-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) return <Skeleton className="h-[400px] w-full rounded-xl" />;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/50 bg-muted/10">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Route Health
          </CardTitle>
          {lastChecked && <p className="text-xs text-muted-foreground mt-1">Last checked: {format(lastChecked, 'MMM d, yyyy HH:mm:ss')}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => runCheck(true)}>
            <RefreshCw className="w-4 h-4 mr-2" /> Run Check
          </Button>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 border-b border-border text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Load Time</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((res, idx) => (
                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{res.route}</td>
                  <td className="px-4 py-3">
                    {res.status === 'ok' ? (
                      res.loadTime > 1000 ? (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Slow</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> OK</Badge>
                      )
                    ) : (
                      <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Error</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{res.loadTime} ms</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{res.error || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}