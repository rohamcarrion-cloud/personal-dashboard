import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const FollowUpRemindersPanel = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [contacts, press, tasks] = await Promise.all([
        pb.collection('contacts_opportunities').getFullList({ filter: `followUpDate <= "${today}"`, $autoCancel: false }),
        pb.collection('press_media').getFullList({ filter: `followUpDate <= "${today}"`, $autoCancel: false }),
        pb.collection('tasks').getFullList({ filter: `dueDate <= "${today}" && status != "Completed"`, $autoCancel: false })
      ]);

      const newReminders = [
        ...contacts.map(c => ({ id: c.id, collection: 'contacts_opportunities', type: 'Contact', name: c.name, date: c.followUpDate, item: c })),
        ...press.map(p => ({ id: p.id, collection: 'press_media', type: 'Press', name: p.title, date: p.followUpDate, item: p })),
        ...tasks.map(t => ({ id: t.id, collection: 'tasks', type: 'Task', name: t.title, date: t.dueDate, item: t }))
      ];

      newReminders.sort((a, b) => new Date(a.date) - new Date(b.date));
      setReminders(newReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleMarkDone = async (reminder) => {
    try {
      if (reminder.collection === 'tasks') {
        await pb.collection('tasks').update(reminder.id, { status: 'Completed' }, { $autoCancel: false });
      } else {
        // For contacts and press, just clear the followUpDate or push it forward
        await pb.collection(reminder.collection).update(reminder.id, { followUpDate: '' }, { $autoCancel: false });
      }
      toast.success('Marked as done');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <Card><CardContent className="p-6 text-center text-muted-foreground">Loading reminders...</CardContent></Card>;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" />
          Follow-ups Due
          {reminders.length > 0 && (
            <Badge variant="secondary" className="ml-2 rounded-full px-2">{reminders.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-6 flex flex-col items-center">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground mb-2 opacity-30" />
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {reminders.map((reminder) => {
              const daysOverdue = differenceInDays(new Date(), new Date(reminder.date));
              return (
                <div key={`${reminder.collection}-${reminder.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/30 border border-border gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background">{reminder.type}</Badge>
                      {daysOverdue > 0 ? (
                        <span className="text-xs font-medium text-destructive">{daysOverdue} days overdue</span>
                      ) : (
                        <span className="text-xs font-medium text-orange-600">Due today</span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{reminder.name}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleMarkDone(reminder)}>Done</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowUpRemindersPanel;