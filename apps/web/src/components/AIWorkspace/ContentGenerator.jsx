import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Sparkles, Wand2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import ContentPreview from './ContentPreview.jsx';

export default function ContentGenerator({ initialContext }) {
  const [providers, setProviders] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [projects, setProjects] = useState([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  const [formData, setFormData] = useState({
    provider: 'openai',
    contentType: 'Blog',
    prompt: '',
    tone: 'Professional',
    audience: '',
    campaignId: 'none',
    projectId: 'none',
    additionalContext: ''
  });

  useEffect(() => {
    if (initialContext) {
      setFormData(prev => ({ ...prev, ...initialContext }));
    }
  }, [initialContext]);

  useEffect(() => {
    // Fetch available context items
    const fetchContexts = async () => {
      try {
        const [camps, projs, statusRes] = await Promise.all([
          pb.collection('campaigns').getFullList({ sort: '-created', $autoCancel: false }),
          pb.collection('projects').getFullList({ sort: '-created', $autoCancel: false }),
          apiServerClient.fetch('/ai/provider-status').then(r => r.json())
        ]);
        
        setCampaigns(camps);
        setProjects(projs);
        
        if (statusRes?.providers) {
          const connected = statusRes.providers.filter(p => p.status === 'connected');
          setProviders(connected.length > 0 ? connected : [{name: 'openai', status: 'connected'}]);
          if (connected.length > 0 && !connected.find(p => p.name === formData.provider)) {
            setFormData(prev => ({ ...prev, provider: connected[0].name }));
          }
        }
      } catch (e) {
        console.error('Failed to load contexts', e);
      }
    };
    fetchContexts();
  }, []);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!formData.prompt) return toast.error('Please enter instructions for the AI');

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const contextString = `
        Tone: ${formData.tone}
        Audience: ${formData.audience || 'General'}
        ${formData.additionalContext ? `Additional Rules: ${formData.additionalContext}` : ''}
      `;

      const res = await apiServerClient.fetch('/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formData.provider,
          contentType: formData.contentType,
          prompt: formData.prompt,
          context: contextString
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setGeneratedResult({
          content: data.content,
          provider: data.provider,
          model: data.model,
          tokens: data.tokens,
          contentType: formData.contentType,
          prompt: formData.prompt
        });
        toast.success('Content generated successfully!');
      } else {
        throw new Error(data.error || data.message || 'Generation failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDatabase = async (dataToSave) => {
    let collectionName = 'blog_posts';
    let payload = {
      title: `AI Generated ${dataToSave.contentType} - ${new Date().toLocaleDateString()}`,
      status: 'Draft',
      aiGenerated: true,
      aiProvider: dataToSave.provider,
      aiModel: dataToSave.model,
      aiPrompt: dataToSave.prompt
    };

    if (formData.campaignId !== 'none') payload.campaignId = formData.campaignId;
    
    switch (dataToSave.contentType) {
      case 'Blog':
        collectionName = 'blog_posts';
        payload.content = dataToSave.content;
        payload.slug = 'ai-draft-' + Date.now();
        break;
      case 'Social':
        collectionName = 'social_posts';
        payload.platforms = 'General';
        payload.contentType = 'Text';
        payload.linkedinCaption = dataToSave.content; 
        if (formData.projectId !== 'none') payload.relatedProject = formData.projectId;
        break;
      case 'Newsletter':
        collectionName = 'newsletter_campaigns';
        payload.subjectLine = 'AI Draft';
        payload.subject = 'AI Draft Subject';
        payload.content = dataToSave.content;
        payload.body = dataToSave.content;
        break;
      case 'Press':
        collectionName = 'press_media';
        payload.pitchStatus = 'Idea';
        payload.notes = dataToSave.content;
        break;
    }

    try {
      await pb.collection(collectionName).create(payload, { $autoCancel: false });
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <Card className="lg:col-span-4 xl:col-span-3 border-border shadow-sm sticky top-4">
        <CardHeader className="pb-4 border-b border-border/50 bg-muted/5">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-5">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={formData.provider} onValueChange={v => setFormData({...formData, provider: v})}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {providers.length > 0 ? providers.map(p => (
                  <SelectItem key={p.name} value={p.name}>{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</SelectItem>
                )) : <SelectItem value="openai">OpenAI</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={formData.contentType} onValueChange={v => setFormData({...formData, contentType: v})}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Blog">Blog Post</SelectItem>
                <SelectItem value="Social">Social Media Post</SelectItem>
                <SelectItem value="Newsletter">Newsletter</SelectItem>
                <SelectItem value="Press">Press Release / Pitch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={formData.tone} onValueChange={v => setFormData({...formData, tone: v})}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
                <SelectItem value="Persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input 
              placeholder="e.g., Tech Founders" 
              value={formData.audience}
              onChange={e => setFormData({...formData, audience: e.target.value})}
              className="bg-background"
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Context Links</Label>
            <Select value={formData.campaignId} onValueChange={v => setFormData({...formData, campaignId: v})}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Link Campaign" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Campaign</SelectItem>
                {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={formData.projectId} onValueChange={v => setFormData({...formData, projectId: v})}>
              <SelectTrigger className="bg-background mt-2"><SelectValue placeholder="Link Project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project</SelectItem>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-8 xl:col-span-9 space-y-6 flex flex-col h-full">
        {!generatedResult ? (
          <Card className="border-border shadow-sm flex-1 flex flex-col min-h-[500px]">
            <CardHeader className="pb-4 border-b border-border/50 bg-muted/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" /> Prompt Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-4">
              <div className="flex-1 flex flex-col space-y-2">
                <Label className="text-base">What do you want to create?</Label>
                <Textarea 
                  placeholder="e.g., Write a comprehensive guide on modern React state management focusing on Context API vs Zustand..."
                  value={formData.prompt}
                  onChange={e => setFormData({...formData, prompt: e.target.value})}
                  className="flex-1 bg-background resize-none min-h-[200px] text-base p-4"
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Guidelines (Optional)</Label>
                <Input 
                  placeholder="e.g., Keep it under 500 words, use bullet points..."
                  value={formData.additionalContext}
                  onChange={e => setFormData({...formData, additionalContext: e.target.value})}
                  className="bg-background"
                />
              </div>
              <Button 
                size="lg" 
                className="w-full sm:w-auto mt-4 self-end rounded-xl"
                onClick={handleGenerate}
                disabled={isGenerating || !formData.prompt}
              >
                {isGenerating ? (
                  <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Generating Magic...</span>
                ) : (
                  <span className="flex items-center"><Wand2 className="w-4 h-4 mr-2" /> Generate Content</span>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex-1 min-h-[500px]">
            <ContentPreview 
              generatedData={generatedResult} 
              onRegenerate={handleGenerate}
              onSave={handleSaveToDatabase}
            />
          </div>
        )}
      </div>
    </div>
  );
}