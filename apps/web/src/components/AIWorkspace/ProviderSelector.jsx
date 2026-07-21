import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import StatusBadge from '@/components/StatusBadge.jsx';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ProviderSelector({ onConfigure }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(null);

  const KNOWN_PROVIDERS = [
    { id: 'openai', name: 'OpenAI', desc: 'GPT-4 and GPT-3.5 models (Default)' },
    { id: 'anthropic', name: 'Anthropic', desc: 'Claude 3 models for nuanced writing' },
    { id: 'gemini', name: 'Google Gemini', desc: 'Gemini Pro for fast, integrated generation' },
    { id: 'openrouter', name: 'OpenRouter', desc: 'Access to multiple open-source models' },
    { id: 'local', name: 'Local / Self-hosted', desc: 'Ollama, LM Studio, or custom endpoints' }
  ];

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/ai/provider-status');
      if (res.ok) {
        const data = await res.json();
        // Merge known providers with backend status
        const merged = KNOWN_PROVIDERS.map(kp => {
          const backendStatus = data.providers?.find(p => p.name === kp.id) || {};
          return { ...kp, ...backendStatus };
        });
        setProviders(merged);
      }
    } catch (error) {
      console.error('Failed to fetch provider status:', error);
      toast.error('Failed to load AI providers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const testConnection = async (providerId) => {
    setTesting(providerId);
    try {
      const res = await apiServerClient.fetch('/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(`Successfully connected to ${providerId}`);
        fetchProviders(); // refresh status
      } else {
        toast.error(data.message || `Failed to connect to ${providerId}`);
      }
    } catch (error) {
      toast.error('Network error while testing connection.');
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {providers.map(provider => {
        const isConnected = provider.status === 'connected';
        const hasError = provider.status === 'error';
        
        let statusDisplay = 'Not Configured';
        if (isConnected) statusDisplay = 'Connected';
        if (hasError) statusDisplay = 'Error';

        return (
          <Card key={provider.id} className="border-border shadow-sm flex flex-col group hover:border-primary/30 transition-colors">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isConnected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-none">{provider.name}</h3>
                  </div>
                </div>
                <StatusBadge 
                  status={isConnected ? 'Active' : hasError ? 'Failed' : 'Draft'} 
                  className={!isConnected && !hasError ? 'bg-muted text-muted-foreground border-transparent' : ''}
                />
              </div>
              
              <p className="text-sm text-muted-foreground flex-1 mb-4">{provider.desc}</p>
              
              {provider.lastTested && isConnected && (
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <Clock className="w-3 h-3 mr-1" /> Last tested: {format(new Date(provider.lastTested), 'MMM d, HH:mm')}
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
                <Button 
                  variant={isConnected ? "outline" : "default"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onConfigure(provider.id)}
                >
                  Configure
                </Button>
                {isConnected && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    disabled={testing === provider.id}
                    onClick={() => testConnection(provider.id)}
                  >
                    {testing === provider.id ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    )}
                    Test
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}