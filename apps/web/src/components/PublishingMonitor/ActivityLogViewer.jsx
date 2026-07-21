import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import apiServerClient from '@/lib/apiServerClient.js';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivityLogViewer({ refreshKey }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [refreshKey]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch('/activity-logs?limit=30');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.items || []);
    } catch (error) {
      console.error('Activity logs fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiServerClient.fetch('/activity-logs/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const getActionBadge = (action) => {
    const a = (action || '').toLowerCase();
    if (a.includes('fail') || a.includes('error')) return <Badge variant="destructive" className="text-[10px]">{action}</Badge>;
    if (a.includes('success') || a.includes('publish')) return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[10px]">{action}</Badge>;
    if (a.includes('retry')) return <Badge className="bg-indigo-500/10 text-indigo-700 border-indigo-200 text-[10px]">{action}</Badge>;
    return <Badge variant="outline" className="text-[10px]">{action}</Badge>;
  };

  return (
    <Card className="border-border shadow-sm mt-8">
      <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle>System Activity Logs</CardTitle>
          <CardDescription>Detailed audit trail of all automated publishing events</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-auto max-h-[400px] custom-scrollbar">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No recent activity logs.</div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md">
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="text-sm">
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created), 'MMM d, HH:mm:ss')}
                  </TableCell>
                  <TableCell>{getActionBadge(log.queueEvent || log.action)}</TableCell>
                  <TableCell className="capitalize">{log.platform || '-'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate" title={log.errorMessage || 'Success'}>
                    {log.errorMessage || 'Success'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}