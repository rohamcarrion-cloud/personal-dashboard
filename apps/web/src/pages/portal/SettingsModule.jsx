import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, ArrowRight, ShieldCheck, Palette } from 'lucide-react';
import { toast } from 'sonner';
import ModuleHeader from '@/components/ModuleHeader.jsx';

const SettingsModule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [formData, setFormData] = useState({
    newsletterSignupEnabled: false, 
    publicBlogEnabled: false, 
    publicProjectsEnabled: false,
  });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const records = await pb.collection('platform_settings').getFullList({ $autoCancel: false });
      if (records.length > 0) {
        const settings = records[0];
        setSettingsId(settings.id);
        setFormData({
          newsletterSignupEnabled: settings.newsletterSignupEnabled || false,
          publicBlogEnabled: settings.publicBlogEnabled || false, 
          publicProjectsEnabled: settings.publicProjectsEnabled || false,
        });
      }
      setLoading(false);
    } catch (error) { 
      toast.error('Failed to load settings'); 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      if (settingsId) {
        await pb.collection('platform_settings').update(settingsId, formData, { $autoCancel: false });
      } else { 
        const record = await pb.collection('platform_settings').create(formData, { $autoCancel: false }); 
        setSettingsId(record.id); 
      }
      toast.success('Settings saved successfully');
    } catch (error) { 
      toast.error('Failed to save settings'); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return <div className="space-y-6 max-w-4xl mx-auto"><Skeleton className="h-12 w-full" /><Skeleton className="h-96 rounded-xl" /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader title="System Settings" description="Manage your platform configuration and system preferences." />

      <Card className="border-border shadow-sm rounded-lg bg-muted/30">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Branding Settings Moved</h3>
              <p className="text-sm text-muted-foreground">Platform name, logos, colors, and social links are now managed in the Branding section.</p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/portal/command-center/branding">
              Go to Branding <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm rounded-lg">
        <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
          <CardTitle className="text-lg">Feature Flags</CardTitle>
          <CardDescription>Enable or disable public-facing features of your platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox id="newsletterSignupEnabled" checked={formData.newsletterSignupEnabled} onCheckedChange={(c) => setFormData({ ...formData, newsletterSignupEnabled: c })} />
                <Label htmlFor="newsletterSignupEnabled" className="cursor-pointer font-medium">Enable Newsletter Signup Form</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="publicBlogEnabled" checked={formData.publicBlogEnabled} onCheckedChange={(c) => setFormData({ ...formData, publicBlogEnabled: c })} />
                <Label htmlFor="publicBlogEnabled" className="cursor-pointer font-medium">Enable Public Blog</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="publicProjectsEnabled" checked={formData.publicProjectsEnabled} onCheckedChange={(c) => setFormData({ ...formData, publicProjectsEnabled: c })} />
                <Label htmlFor="publicProjectsEnabled" className="cursor-pointer font-medium">Enable Public Projects Portfolio</Label>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-border">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5 shadow-sm rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg"><Brain className="w-5 h-5 text-primary" /> AI Integration Roadmap</CardTitle>
          <CardDescription className="text-primary/80">System documentation and architecture planning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-background p-4 rounded-lg border border-primary/20">
              <p className="font-semibold text-foreground mb-1">Current Status</p>
              <p className="text-muted-foreground">Rule-based Smart Assistant (Phase 8)</p>
            </div>
            <div className="bg-background p-4 rounded-lg border border-primary/20">
              <p className="font-semibold text-foreground mb-1">Next Phase</p>
              <p className="text-muted-foreground">AI Model Workspace (Phase 10)</p>
            </div>
          </div>
          <div className="bg-background p-4 rounded-lg border border-primary/20 text-sm">
            <p className="font-semibold text-foreground mb-2">Supported Providers</p>
            <p className="text-muted-foreground mb-2">OpenAI (Default), OpenRouter, Anthropic, Google Gemini, Local/Self-hosted.</p>
            <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <p>API keys will be stored securely server-side. No API fields will be exposed in the frontend.</p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 text-primary mt-2">
            <Link to="/portal/ai-integration-plan">View AI Integration Plan <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModule;