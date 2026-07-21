import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, className }) {
  const getStatusStyles = (s) => {
    const normalized = (s || '').toLowerCase();
    switch(normalized) {
      case 'published':
      case 'active':
      case 'completed':
      case 'sent':
      case 'accepted':
        return 'bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 dark:border-green-900';
      case 'scheduled':
      case 'in progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-900';
      case 'draft':
      case 'drafted':
      case 'planning':
      case 'idea':
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-900';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-900';
      case 'paused':
        return 'bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400 dark:border-orange-900';
      case 'followed up':
        return 'bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400 dark:border-purple-900';
      case 'archived':
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Badge variant="outline" className={cn(`font-medium px-2.5 py-0.5 ${getStatusStyles(status)}`, className)}>
      {status || 'Unknown'}
    </Badge>
  );
}