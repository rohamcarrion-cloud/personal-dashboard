import React, { useState, useEffect } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, CalendarDays, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function SchedulingSuggestions({ platform, campaignId, onApply }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (platform) fetchSuggestions();
  }, [platform, campaignId]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ platform });
      if (campaignId) params.append('campaign', campaignId);
      
      const res = await apiServerClient.fetch(`/publishing/suggestions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-24 bg-muted rounded-xl w-full"></div>;
  if (suggestions.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-100 dark:border-indigo-900/50">
      <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
        <Sparkles className="w-4 h-4" />
        <span>Smart Scheduling Suggestions</span>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((sug, idx) => (
          <div key={idx} className="flex items-start justify-between p-3 bg-white dark:bg-card rounded-lg border border-border/50 shadow-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {sug.type === 'time' ? <Clock className="w-4 h-4 text-muted-foreground" /> : <CalendarDays className="w-4 h-4 text-muted-foreground" />}
                <span className="font-semibold text-sm">{sug.day || 'Today'} at {sug.time}</span>
                <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {sug.confidence}% Match
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{sug.reason}</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => onApply(sug.dateValue || sug.time)}>
              Apply
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}