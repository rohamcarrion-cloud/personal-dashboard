import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, Download, RefreshCw, AlertTriangle, Info, XCircle } from 'lucide-react';
import { checkDataHealth } from '@/utils/dataHealthCheck.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CACHE_KEY = 'dataHealthCache';
const CACHE_TTL = 5 * 60 * 1000;

export default function DataHealthSection() {
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

      const data = await checkDataHealth();
      setResults(data);
      const now = new Date();
      setLastChecked(now);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: now.getTime() }));
      if (force) toast.success('Data health check completed');
    } catch (error) {
      toast.error('Failed to run data health check');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const exportReport = () => {
    const csv = [
      ['Collection', 'Total Records', 'Issue Type', 'Count', 'Severity'],
      ...results.flatMap(r => 
        r.issues.length === 0 
          ? [[r.collection, r.totalRecords, 'None', 0, 'OK']]
          : r.issues.map(i => [r.collection, r.totalRecords, i.type, i.count, i.severity])
      )
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-health-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'Critical': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Critical</Badge>;
      case 'Warning': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1"/> Warning</Badge>;
      case 'Info': return <Badge variant="secondary"><Info className="w-3 h-3 mr-1"/> Info</Badge>;
      default: return <Badge>{severity}</Badge>;
    }
  };

  if (loading) return <Skeleton className="h-[400px] w-full rounded-xl" />;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/50 bg-muted/10">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> Data Quality & Health
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
                <th className="px-4 py-3 font-medium">Collection</th>
                <th className="px-4 py-3 font-medium text-center">Total Records</th>
                <th className="px-4 py-3 font-medium">Identified Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((res, idx) => (
                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-4 font-medium text-foreground align-top">{res.collection}</td>
                  <td className="px-4 py-4 text-center text-muted-foreground align-top">{res.totalRecords}</td>
                  <td className="px-4 py-4 align-top">
                    {res.issues.length === 0 ? (
                      <span className="text-muted-foreground text-sm">No issues detected</span>
                    ) : (
                      <div className="space-y-3">
                        {res.issues.map((issue, i) => (
                          <div key={i} className="flex items-center justify-between bg-background p-2 rounded-md border border-border">
                            <div className="flex items-center gap-3">
                              {getSeverityBadge(issue.severity)}
                              <span className="font-medium">{issue.type}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground text-xs font-medium">{issue.count} records</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}