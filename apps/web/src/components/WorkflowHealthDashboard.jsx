import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, FileText, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const WorkflowHealthDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [drafts, scheduled, failed, overdueTasks, events] = await Promise.all([
          pb.collection('blog_posts').getList(1, 1, { filter: 'status="Draft"', $autoCancel: false }),
          pb.collection('social_posts').getList(1, 1, { filter: `status="Scheduled" && scheduledDate >= "${today}" && scheduledDate <= "${nextWeek}"`, $autoCancel: false }),
          pb.collection('social_posts').getList(1, 1, { filter: 'status="Failed"', $autoCancel: false }),
          pb.collection('tasks').getList(1, 1, { filter: `dueDate < "${today}" && status != "Completed"`, $autoCancel: false }),
          pb.collection('events').getList(1, 1, { filter: `date >= "${today}" && date <= "${nextWeek}"`, $autoCancel: false })
        ]);

        setMetrics({
          drafts: drafts.totalItems,
          scheduled: scheduled.totalItems,
          failed: failed.totalItems,
          overdueTasks: overdueTasks.totalItems,
          upcomingEvents: events.totalItems
        });
      } catch (error) {
        console.error("Error fetching health metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  if (loading) return <Skeleton className="h-32 w-full rounded-2xl" />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
          <FileText className="w-5 h-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold">{metrics?.drafts || 0}</p>
          <p className="text-xs text-muted-foreground">Drafts</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
          <Calendar className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-600">{metrics?.scheduled || 0}</p>
          <p className="text-xs text-muted-foreground">Scheduled (7d)</p>
        </CardContent>
      </Card>
      <Card className={`border-border shadow-sm ${metrics?.failed > 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-card'}`}>
        <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
          <AlertTriangle className={`w-5 h-5 mb-2 ${metrics?.failed > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          <p className={`text-2xl font-bold ${metrics?.failed > 0 ? 'text-destructive' : ''}`}>{metrics?.failed || 0}</p>
          <p className="text-xs text-muted-foreground">Failed Posts</p>
        </CardContent>
      </Card>
      <Card className={`border-border shadow-sm ${metrics?.overdueTasks > 0 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-card'}`}>
        <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
          <Activity className={`w-5 h-5 mb-2 ${metrics?.overdueTasks > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          <p className={`text-2xl font-bold ${metrics?.overdueTasks > 0 ? 'text-orange-600' : ''}`}>{metrics?.overdueTasks || 0}</p>
          <p className="text-xs text-muted-foreground">Overdue Tasks</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
          <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{metrics?.upcomingEvents || 0}</p>
          <p className="text-xs text-muted-foreground">Events (7d)</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowHealthDashboard;