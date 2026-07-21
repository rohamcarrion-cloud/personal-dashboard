import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Megaphone, Shuffle, LineChart, Wand2 } from 'lucide-react';

export default function SuggestionsPanel({ onSelectSuggestion }) {
  const suggestions = [
    {
      id: 's1',
      icon: <Shuffle className="w-5 h-5 text-blue-500" />,
      title: 'Repurpose Blog to Social Thread',
      description: 'Convert a long-form blog post into a highly engaging Twitter/X thread or LinkedIn carousel.',
      type: 'Social',
      prompt: 'Repurpose my recent blog post into a 5-part Twitter thread. Extract the core insights and format them appropriately.'
    },
    {
      id: 's2',
      icon: <MessageSquare className="w-5 h-5 text-green-500" />,
      title: 'Sales Follow-up Email',
      description: 'Draft a polite but persuasive follow-up email after a demo or pitch meeting.',
      type: 'Newsletter',
      prompt: 'Write a concise, 3-paragraph follow-up email to a prospective client after a product demo. Tone should be professional and helpful.'
    },
    {
      id: 's3',
      icon: <Megaphone className="w-5 h-5 text-purple-500" />,
      title: 'Campaign Announcement Pitch',
      description: 'Generate a press release outline for your upcoming major campaign or feature launch.',
      type: 'Press',
      prompt: 'Draft a media pitch announcing our new AI Integration feature. Highlight the time-saving benefits and ease of use.'
    },
    {
      id: 's4',
      icon: <LineChart className="w-5 h-5 text-orange-500" />,
      title: 'Monthly Newsletter Summary',
      description: 'Summarize the past month\'s achievements into an engaging newsletter for subscribers.',
      type: 'Newsletter',
      prompt: 'Create a structure and draft content for a monthly newsletter summarizing 3 major updates and providing 1 actionable tip.'
    },
    {
      id: 's5',
      icon: <Sparkles className="w-5 h-5 text-pink-500" />,
      title: 'Brand Voice Guidelines',
      description: 'Generate standard brand voice principles based on your target audience and mission.',
      type: 'Blog',
      prompt: 'Generate a comprehensive set of brand voice guidelines including preferred tone, words to use, and words to avoid.'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id} className="border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/5">
            <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
              {suggestion.icon}
            </div>
            <CardTitle className="text-lg">{suggestion.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {suggestion.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 mt-auto flex items-center gap-3">
            <Button 
              className="w-full rounded-xl" 
              onClick={() => onSelectSuggestion({ 
                contentType: suggestion.type, 
                prompt: suggestion.prompt 
              })}
            >
              <Wand2 className="w-4 h-4 mr-2" /> Start with this
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}