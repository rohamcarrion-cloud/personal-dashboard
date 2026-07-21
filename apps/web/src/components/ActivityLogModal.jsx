import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export default function ActivityLogModal({ isOpen, onClose, postId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && postId) {
      fetchActivities();
    }
  }, [isOpen, postId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('social_post_activity').getList(1, 100, {
        filter: `postId="${postId}"`,
        sort: '-timestamp',
        $autoCancel: false
      });
      setActivities(records.items);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Post Activity Log
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 border rounded-md">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No activity recorded for this post yet.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {format(new Date(activity.timestamp || activity.created), 'MMM d, HH:mm:ss')}
                    </TableCell>
                    <TableCell className="capitalize font-medium">{activity.platform}</TableCell>
                    <TableCell className="capitalize">{activity.action}</TableCell>
                    <TableCell>
                      <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className="capitalize">
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {activity.errorMessage ? (
                        <span className="text-destructive" title={activity.errorMessage}>{activity.errorMessage}</span>
                      ) : activity.externalPostId ? (
                        <span className="text-muted-foreground">ID: {activity.externalPostId}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}