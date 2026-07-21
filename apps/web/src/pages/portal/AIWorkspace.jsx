import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import ProviderSelector from '@/components/AIWorkspace/ProviderSelector.jsx';
import APIKeyManager from '@/components/AIWorkspace/APIKeyManager.jsx';
import ContentGenerator from '@/components/AIWorkspace/ContentGenerator.jsx';
import SuggestionsPanel from '@/components/AIWorkspace/SuggestionsPanel.jsx';
import UsageHistory from '@/components/AIWorkspace/UsageHistory.jsx';

export default function AIWorkspace() {
  const [activeTab, setActiveTab] = useState('generation');
  const [selectedProviderForSetup, setSelectedProviderForSetup] = useState(null);
  const [generatorContext, setGeneratorContext] = useState(null);

  const handleConfigureProvider = (providerId) => {
    setSelectedProviderForSetup(providerId);
    setActiveTab('setup');
  };

  const handleSuggestionSelect = (context) => {
    setGeneratorContext(context);
    setActiveTab('generation');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <Helmet>
        <title>AI Workspace | Command Center</title>
      </Helmet>

      <ModuleHeader 
        title="AI Workspace" 
        description="Centralized AI integration for content generation, smart suggestions, and workflow automation."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full bg-card border border-border rounded-2xl shadow-sm p-1">
        <div className="p-3 border-b border-border/50 bg-muted/20">
          <TabsList className="grid w-full sm:w-[500px] grid-cols-4 bg-background">
            <TabsTrigger value="generation">Generator</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 md:p-6 min-h-[600px] bg-background/50 rounded-b-xl">
          <TabsContent value="generation" className="mt-0 outline-none h-full">
            <ContentGenerator initialContext={generatorContext} />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-0 outline-none">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Smart Suggestions</h2>
              <p className="text-muted-foreground">Select a workflow to quickly generate high-quality content based on best practices.</p>
            </div>
            <SuggestionsPanel onSelectSuggestion={handleSuggestionSelect} />
          </TabsContent>

          <TabsContent value="history" className="mt-0 outline-none">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Generation History</h2>
              <p className="text-muted-foreground">Track token usage, cost, and historical outputs across all providers.</p>
            </div>
            <UsageHistory />
          </TabsContent>

          <TabsContent value="setup" className="mt-0 outline-none">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Provider Setup</h2>
              <p className="text-muted-foreground">Configure and manage connections to external AI models and services securely.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 xl:col-span-8">
                <ProviderSelector onConfigure={handleConfigureProvider} />
              </div>
              <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
                <APIKeyManager 
                  selectedProvider={selectedProviderForSetup} 
                  onSaved={() => setSelectedProviderForSetup(null)} 
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}