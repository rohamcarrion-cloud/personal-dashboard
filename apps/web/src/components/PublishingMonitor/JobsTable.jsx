import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile.jsx';
import { Eye, RefreshCcw, XCircle, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function JobsTable({ 
  jobs, 
  isLoading, 
  page, 
  totalPages, 
  setPage, 
  onView, 
  onRetry, 
  onCancel 
}) {
  const isMobile = useIsMobile();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published': return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Published</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'processing': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Processing</Badge>;
      case 'retrying': return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Retrying</Badge>;
      case 'cancelled': return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border rounded-2xl bg-muted/10">
        <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium">No jobs found</h3>
        <p className="text-muted-foreground text-center mt-1">Try adjusting your filters or date range.</p>
      </div>
    );
  }

  const renderPagination = () => (
    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
      <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        {jobs.map(job => {
          const postTitle = job.expand?.socialPostId?.title || 'Unknown Post';
          const accountName = job.expand?.accountId?.accountName || 'Unknown Account';
          
          return (
            <Card key={job.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-sm line-clamp-2 pr-2">{postTitle}</div>
                  {getStatusBadge(job.status)}
                </div>
                <div className="text-xs text-muted-foreground flex flex-col gap-1">
                  <span className="capitalize"><span className="font-medium text-foreground">{job.platform}</span> • {accountName}</span>
                  <span>{format(new Date(job.scheduledAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => onView(job)}>
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  {(job.status === 'failed' || job.status === 'cancelled') && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onRetry(job.id)}>
                      <RefreshCcw className="w-4 h-4 mr-1" /> Retry
                    </Button>
                  )}
                  {(job.status === 'pending' || job.status === 'retrying') && (
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => onCancel(job.id)}>
                      <XCircle className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {renderPagination()}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Post Title</TableHead>
            <TableHead>Platform & Account</TableHead>
            <TableHead>Scheduled For</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Retries</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map(job => {
            const postTitle = job.expand?.socialPostId?.title || 'Unknown Post';
            const accountName = job.expand?.accountId?.accountName || 'Unknown Account';
            
            return (
              <TableRow key={job.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium max-w-[250px] truncate" title={postTitle}>
                  {postTitle}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="capitalize font-medium">{job.platform}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{accountName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                  {format(new Date(job.scheduledAt), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {getStatusBadge(job.status)}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {job.retryCount || 0}/{job.maxRetries || 3}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(job)} title="View Details">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    {(job.status === 'failed' || job.status === 'cancelled') && (
                      <Button variant="ghost" size="sm" onClick={() => onRetry(job.id)} title="Retry Job">
                        <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                    {(job.status === 'pending' || job.status === 'retrying') && (
                      <Button variant="ghost" size="sm" onClick={() => onCancel(job.id)} title="Cancel Job" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="p-4 bg-card">
        {renderPagination()}
      </div>
    </div>
  );
}