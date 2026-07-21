import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { generateOverdueTasks } from '@/lib/AssistantRulesEngine.js';

const TaskSuggestionsPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const tasks = await generateOverdueTasks();
        setSuggestions(tasks.slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (suggestions.length === 0) return null;

  return (
    <Card className="border-border shadow-sm bg-muted/10 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Smart Task Suggestions
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Suggested tasks based on your workflow</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suggestions.map(s => (
          <div key={s.id} className="p-3 rounded-xl bg-background border border-border text-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-medium mb-1">
                <CheckSquare className="w-3.5 h-3.5 text-green-500" />
                {s.title}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{s.description}</p>
            </div>
            <Button variant="secondary" size="sm" className="w-full h-7 text-xs" onClick={() => toast.success('Task updated!')}>
              {s.actionType}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TaskSuggestionsPanel;