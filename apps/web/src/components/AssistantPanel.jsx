import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Lightbulb, Activity, CheckSquare, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  generateContentIdeas, 
  generateNextActions, 
  generateCampaignHealth, 
  generateFollowUpSuggestions, 
  generateOverdueTasks, 
  generateRepurposingSuggestions 
} from '@/lib/AssistantRulesEngine.js';

const AssistantPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [ideas, actions, health, followUps, tasks, repurpose] = await Promise.all([
          generateContentIdeas(),
          generateNextActions(),
          generateCampaignHealth(),
          generateFollowUpSuggestions(),
          generateOverdueTasks(),
          generateRepurposingSuggestions()
        ]);
        
        const all = [...ideas, ...actions, ...health, ...followUps, ...tasks, ...repurpose]
          .sort((a, b) => {
            const p = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
            return (p[b.priority] || 0) - (p[a.priority] || 0);
          })
          .slice(0, 6);
          
        setSuggestions(all);
      } catch (error) {
        console.error("Failed to load suggestions", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSuggestions();
  }, []);

  const handleAction = (suggestion) => {
    toast.success(`Action triggered: ${suggestion.actionType}`);
    // In a full implementation, this would open modals or create records via pb.collection
    if (suggestion.actionType === 'Create Task') {
      navigate('/portal/command-center/tasks');
    } else if (suggestion.actionType === 'Create Draft') {
      navigate('/portal/command-center/content-engine');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Content Idea': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'Action': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'Health': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Follow-up': return <ArrowRight className="w-4 h-4 text-purple-500" />;
      case 'Task': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'Repurpose': return <RefreshCw className="w-4 h-4 text-orange-500" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Smart Assistant
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Rule-based workflow suggestions</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-border shadow-sm bg-gradient-to-b from-card to-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Smart Assistant
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Rule-based workflow suggestions</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map(s => (
          <div key={s.id} className="p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                {getIcon(s.suggestionType)}
                <span className="line-clamp-1">{s.title}</span>
              </div>
              {(s.priority === 'High' || s.priority === 'Critical') && (
                <Badge variant={s.priority === 'Critical' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                  {s.priority}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
            <div className="flex justify-end mt-1">
              <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => handleAction(s)}>
                {s.actionType}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AssistantPanel;