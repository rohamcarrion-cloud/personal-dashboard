import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { generateContentIdeas } from '@/lib/AssistantRulesEngine.js';

const ContentSuggestionsPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ideas = await generateContentIdeas();
        setSuggestions(ideas.slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (suggestions.length === 0) return null;

  return (
    <Card className="border-border shadow-sm bg-muted/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Content Ideas
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Suggestions based on your content patterns</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map(s => (
          <div key={s.id} className="p-3 rounded-xl bg-background border border-border text-sm">
            <div className="flex items-center gap-2 font-medium mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
              {s.title}
            </div>
            <p className="text-xs text-muted-foreground mb-3">{s.description}</p>
            <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => toast.success('Draft created!')}>
              {s.actionType}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContentSuggestionsPanel;