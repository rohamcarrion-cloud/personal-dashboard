import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';

export default function ActivityLogs({ jobId }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const result = await pb.collection('social_post_activity').getList(1, 50, {
          filter: `jobId = "${jobId}"`,
          sort: '-created',
          $autoCancel: false
        });
        setLogs(result.items);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border mt-4">
        <p className="text-sm text-muted-foreground">No activity logs found for this job.</p>
      </div>
    );
  }

  const getActionIcon = (action, status) => {
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-destructive" />;
    if (action === 'published') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (action === 'scheduled' || action === 'retried') return <Clock className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-3 px-1">Activity Timeline</h3>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[160px]">Timestamp</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(log.created), 'MMM d, HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action, log.status)}
                    <span className="font-medium capitalize text-sm">{log.action}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'} 
                         className={log.status === 'success' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs">
                  {log.errorMessage ? (
                    <span className="text-destructive">{log.errorMessage}</span>
                  ) : log.queueEvent ? (
                    <span className="text-muted-foreground">{log.queueEvent}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {log.duration ? `${log.duration}ms` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}