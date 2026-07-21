import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiServerClient from '@/lib/apiServerClient.js';
import { format } from 'date-fns';
import { Search, Download, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityLogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  
  useEffect(() => { fetchLogs(); }, [actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (search) params.append('search', search);
      
      const res = await apiServerClient.fetch(`/logs/activity?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = `/hcgi/api/logs/export?format=csv`;
  };

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <div className="p-4 border-b border-border bg-muted/10 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-1 gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search logs..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchLogs()}
              className="pl-9 bg-background" 
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="error">System Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
              <TableHead>Message / Details</TableHead>
              <TableHead className="w-[150px]">Platform</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                  No logs match your filters.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, i) => (
                <TableRow key={i} className="font-mono text-xs hover:bg-muted/30">
                  <TableCell className="text-muted-foreground">
                    {format(new Date(log.timestamp || log.created), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${log.action === 'failed' || log.action === 'error' ? 'border-destructive text-destructive' : ''}
                      ${log.action === 'published' ? 'border-green-500 text-green-600' : ''}
                    `}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground max-w-md truncate" title={log.message}>
                    {log.message}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {log.platform || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}