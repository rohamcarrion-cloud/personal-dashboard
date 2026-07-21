import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import ActivityLogs from './ActivityLogs.jsx';
import { ExternalLink, RefreshCcw, XCircle } from 'lucide-react';

export default function JobDetailsModal({ job, open, onOpenChange, onRetry, onCancel }) {
  if (!job) return null;

  const postTitle = job.expand?.socialPostId?.title || 'Unknown Post';
  const accountName = job.expand?.accountId?.accountName || 'Unknown Account';
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'published': return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Published</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'processing': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Processing</Badge>;
      case 'retrying': return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Retrying</Badge>;
      default: return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'MMM d, yyyy HH:mm:ss');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Job Details</DialogTitle>
          <DialogDescription>
            Detailed information and activity timeline for this publishing job.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4 bg-muted/20 p-5 rounded-xl border border-border">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Post Content</p>
            <p className="font-medium text-sm truncate" title={postTitle}>{postTitle}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</p>
            <div>{getStatusBadge(job.status)}</div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Platform & Account</p>
            <div className="flex items-center gap-2">
              <span className="capitalize text-sm font-medium">{job.platform}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-sm truncate max-w-[120px]">{accountName}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Scheduled Time</p>
            <p className="text-sm font-mono">{formatDate(job.scheduledAt)}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Started / Completed</p>
            <p className="text-xs text-muted-foreground font-mono">
              S: {formatDate(job.startedAt)}<br/>
              C: {formatDate(job.completedAt)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Retry Info</p>
            <p className="text-sm">Attempt {job.retryCount || 0} of {job.maxRetries || 3}</p>
          </div>

          {job.errorMessage && (
            <div className="col-span-1 sm:col-span-2 mt-2">
              <p className="text-xs font-medium text-destructive uppercase tracking-wider mb-1">Error Message</p>
              <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg border border-destructive/20 font-mono break-all">
                {job.errorMessage}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {(job.status === 'failed' || job.status === 'cancelled') && (
            <Button onClick={() => onRetry(job.id)} className="gap-2">
              <RefreshCcw className="w-4 h-4" /> Retry Job
            </Button>
          )}
          
          {(job.status === 'pending' || job.status === 'retrying') && (
            <Button variant="destructive" onClick={() => onCancel(job.id)} className="gap-2">
              <XCircle className="w-4 h-4" /> Cancel Job
            </Button>
          )}

          {job.externalUrl && (
            <Button variant="outline" asChild className="gap-2">
              <a href={job.externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> View Live Post
              </a>
            </Button>
          )}
        </div>

        <ActivityLogs jobId={job.id} />
      </DialogContent>
    </Dialog>
  );
}