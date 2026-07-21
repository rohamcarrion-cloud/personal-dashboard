import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Save, RefreshCw, PenTool, CheckCircle2, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentPreview({ generatedData, onRegenerate, onSave }) {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (generatedData?.content) {
      setContent(generatedData.content);
    }
  }, [generatedData]);

  if (!generatedData) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ ...generatedData, content });
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200) || 1;

  return (
    <Card className="border-border shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">Generated Preview</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {generatedData.provider}
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              {generatedData.model}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
          <span className="flex items-center"><Zap className="w-3 h-3 mr-1 text-yellow-500" /> {generatedData.tokens || 0} tokens</span>
          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {readingTime} min read</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        {isEditing ? (
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[300px] border-0 focus-visible:ring-0 rounded-none bg-background p-6 resize-none font-medium leading-relaxed"
          />
        ) : (
          <div className="flex-1 min-h-[300px] p-6 bg-card overflow-y-auto whitespace-pre-wrap leading-relaxed text-foreground">
            {content}
          </div>
        )}
        
        <div className="p-4 border-t border-border bg-muted/10 flex flex-wrap items-center gap-3">
          <Button 
            variant={isEditing ? "secondary" : "outline"} 
            onClick={() => setIsEditing(!isEditing)}
            className="min-w-[100px]"
          >
            {isEditing ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Done</>
            ) : (
              <><PenTool className="w-4 h-4 mr-2" /> Edit</>
            )}
          </Button>
          
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" /> Copy
          </Button>
          
          <Button variant="outline" onClick={onRegenerate}>
            <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
          </Button>
          
          <div className="ml-auto">
            <Button onClick={handleSave} disabled={isSaving || !content.trim()}>
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}