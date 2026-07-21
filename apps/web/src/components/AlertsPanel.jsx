import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [failedSocial, overdueTasks, overdueContacts, overduePress, oldDraftsBlog, oldDraftsSocial] = await Promise.all([
        pb.collection('social_posts').getFullList({ filter: 'status="Failed"', $autoCancel: false }),
        pb.collection('tasks').getFullList({ filter: `dueDate < "${today}" && status != "Completed"`, $autoCancel: false }),
        pb.collection('contacts_opportunities').getFullList({ filter: `followUpDate <= "${today}"`, $autoCancel: false }),
        pb.collection('press_media').getFullList({ filter: `followUpDate <= "${today}"`, $autoCancel: false }),
        pb.collection('blog_posts').getFullList({ filter: `status="Draft" && created < "${fourteenDaysAgo}"`, $autoCancel: false }),
        pb.collection('social_posts').getFullList({ filter: `status="Draft" && created < "${fourteenDaysAgo}"`, $autoCancel: false })
      ]);

      const newAlerts = [];

      failedSocial.forEach(item => {
        newAlerts.push({ id: `fs-${item.id}`, type: 'Failed Post', name: item.title, severity: 'Critical', date: item.updated, item });
      });

      overdueTasks.forEach(item => {
        newAlerts.push({ id: `ot-${item.id}`, type: 'Overdue Task', name: item.title, severity: 'Critical', date: item.dueDate, item });
      });

      overdueContacts.forEach(item => {
        newAlerts.push({ id: `oc-${item.id}`, type: 'Overdue Follow-up', name: item.name, severity: 'Critical', date: item.followUpDate, item });
      });

      overduePress.forEach(item => {
        newAlerts.push({ id: `op-${item.id}`, type: 'Overdue Press', name: item.title, severity: 'Critical', date: item.followUpDate, item });
      });

      oldDraftsBlog.forEach(item => {
        newAlerts.push({ id: `odb-${item.id}`, type: 'Old Draft', name: item.title, severity: 'High', date: item.created, item });
      });

      oldDraftsSocial.forEach(item => {
        newAlerts.push({ id: `ods-${item.id}`, type: 'Old Draft', name: item.title, severity: 'High', date: item.created, item });
      });

      // Sort by severity (Critical first, then High)
      newAlerts.sort((a, b) => {
        if (a.severity === 'Critical' && b.severity !== 'Critical') return -1;
        if (a.severity !== 'Critical' && b.severity === 'Critical') return 1;
        return new Date(a.date) - new Date(b.date);
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'High': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) return <Card><CardContent className="p-6 text-center text-muted-foreground">Loading alerts...</CardContent></Card>;

  return (
    <Card className="border-destructive/20 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          Action Required
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-2 rounded-full px-2">{alerts.length}</Badge>
          )}
        </CardTitle>
        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setAlerts([])} className="text-xs h-8">Clear All</Button>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6 flex flex-col items-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">All clear! No critical alerts.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-3 rounded-xl bg-muted/50 border border-border group">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">{alert.type}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{alert.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.date ? format(new Date(alert.date), 'MMM d, yyyy') : 'Unknown date'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => dismissAlert(alert.id)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {alerts.length > 5 && (
              <p className="text-xs text-center text-muted-foreground pt-2">+ {alerts.length - 5} more alerts</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;