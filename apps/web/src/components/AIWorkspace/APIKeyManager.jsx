import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, ShieldCheck, Save, Zap, RefreshCw, Check, AlertCircle, Loader } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export default function APIKeyManager({ selectedProvider, onSaved }) {
  const [provider, setProvider] = useState(selectedProvider || 'openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (selectedProvider) {
      setProvider(selectedProvider);
      setApiKey('');
      setEndpoint('');
      // Set defaults
      if (selectedProvider === 'openai') setModel('gpt-4o');
      if (selectedProvider === 'anthropic') setModel('claude-3-sonnet');
      if (selectedProvider === 'gemini') setModel('gemini-pro');
      if (selectedProvider === 'openrouter') setModel('openai/gpt-3.5-turbo');
      if (selectedProvider === 'local') setModel('llama3');
    }
  }, [selectedProvider]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey) return toast.error('API Key is required');
    
    setIsSaving(true);
    try {
      const res = await apiServerClient.fetch('/ai/configure-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, model, endpoint })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(`${provider} configuration saved securely.`);
        setApiKey(''); // Clear from frontend state
        if (onSaved) onSaved();
      } else {
        toast.error(data.message || 'Failed to save configuration');
      }
    } catch (error) {
      toast.error('Network error. Failed to save.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const res = await apiServerClient.fetch('/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success('Connection successful!');
      } else {
        toast.error(data.message || 'Connection failed.');
      }
    } catch (error) {
      toast.error('Connection test failed.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
        <CardTitle className="text-lg">Configure Provider</CardTitle>
        <CardDescription>
          API keys are stored securely on the server and are never exposed to the browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="local">Local / Self-Hosted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Default Model</Label>
              <Input 
                value={model} 
                onChange={(e) => setModel(e.target.value)} 
                placeholder="e.g., gpt-4o, claude-3-opus"
                className="bg-background"
              />
            </div>
          </div>

          {provider === 'local' && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label>Endpoint URL</Label>
              <Input 
                value={endpoint} 
                onChange={(e) => setEndpoint(e.target.value)} 
                placeholder="http://localhost:11434/v1"
                className="bg-background"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Input 
                type={showKey ? "text" : "password"} 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="sk-..."
                className="bg-background pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ShieldCheck className="w-3 h-3 mr-1 text-green-600" /> Keys are encrypted and stored server-side.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-none">
              {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Configuration
            </Button>
            <Button type="button" variant="secondary" onClick={handleTest} disabled={isTesting} className="flex-1 sm:flex-none">
              {isTesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Test Connection
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}