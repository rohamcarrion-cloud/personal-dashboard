import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Network, Download, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { checkRelationshipHealth } from '@/utils/relationshipHealthCheck.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CACHE_KEY = 'relHealthCache';
const CACHE_TTL = 5 * 60 * 1000;

export default function RelationshipHealthSection() {
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

      const data = await checkRelationshipHealth();
      setResults(data);
      const now = new Date();
      setLastChecked(now);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: now.getTime() }));
      if (force) toast.success('Relationship health check completed');
    } catch (error) {
      toast.error('Failed to run relationship health check');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const exportReport = () => {
    const csv = [
      ['Relationship', 'Parent Count', 'Connected', 'Orphaned', 'Broken', 'Health Score'],
      ...results.map(r => [r.relationship, r.parentCount, r.connectedCount, r.orphanedCount, r.brokenCount, `${r.healthScore}%`])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relationship-health-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getStatusBadge = (score) => {
    if (score === 100) return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Healthy</Badge>;
    if (score >= 90) return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1"/> Warning</Badge>;
    return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Critical</Badge>;
  };

  if (loading) return <Skeleton className="h-[400px] w-full rounded-xl" />;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/50 bg-muted/10">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" /> Relationship Health
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
                <th className="px-4 py-3 font-medium">Relationship</th>
                <th className="px-4 py-3 font-medium text-center">Parents</th>
                <th className="px-4 py-3 font-medium text-center">Connected</th>
                <th className="px-4 py-3 font-medium text-center">Orphaned</th>
                <th className="px-4 py-3 font-medium text-center">Broken</th>
                <th className="px-4 py-3 font-medium text-center">Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((res, idx) => (
                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{res.relationship}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{res.parentCount}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{res.connectedCount}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{res.orphanedCount}</td>
                  <td className="px-4 py-3 text-center text-destructive font-medium">{res.brokenCount}</td>
                  <td className="px-4 py-3 text-center font-medium">{res.healthScore}%</td>
                  <td className="px-4 py-3">{getStatusBadge(res.healthScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}