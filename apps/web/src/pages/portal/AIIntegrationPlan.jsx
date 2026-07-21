import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Shield, Server, Zap, Code, AlertTriangle, CheckCircle2, Lock, Network, ListChecks } from 'lucide-react';

const AIIntegrationPlan = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500 print:bg-white print:text-black">
      {/* Header Section */}
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/portal/command-center/settings"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Integration Plan
          </h1>
          <p className="text-muted-foreground mt-1">
            Strategic roadmap and security architecture for future artificial intelligence capabilities.
          </p>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          AI Integration Plan & Architecture
        </h1>
        <p className="text-gray-600 mt-2">Document generated from System Settings</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 print:hidden">
          <TabsTrigger value="overview">Overview & State</TabsTrigger>
          <TabsTrigger value="architecture">Architecture & Security</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Roadmap</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & STATE */}
        <TabsContent value="overview" className="space-y-6 print:block">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Server className="w-5 h-5 text-blue-500" />
                  Current State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p>
                  The current <strong>Smart Assistant</strong> is strictly rule-based. It utilizes the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">AssistantRulesEngine.js</code> utility to analyze existing PocketBase data patterns.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span><strong>No External APIs:</strong> There are zero external AI APIs connected to the current system.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span><strong>No ML Models:</strong> The system does not use machine learning, natural language processing, or generative models.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span><strong>Data-Driven Rules:</strong> All suggestions (content gaps, overdue tasks, follow-ups) are generated via deterministic JavaScript logic querying the database.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Current Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>No external AI APIs connected</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Suggestions are rule-based only</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>No machine learning model involvement</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>No automated content generation capability</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>No advanced semantic analysis capability</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 shadow-sm bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Future Capabilities (When AI Integrated)
              </CardTitle>
              <CardDescription>
                Integrating a true AI backend will unlock the following advanced features:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'AI-powered content generation',
                  'Smart content repurposing',
                  'Campaign analysis & insights',
                  'Intelligent follow-up drafting',
                  'Brand voice analysis',
                  'Content optimization suggestions',
                  'Market trend analysis',
                  'Audience engagement insights'
                ].map((capability, i) => (
                  <div key={i} className="bg-background border border-border p-3 rounded-xl text-sm font-medium text-center flex items-center justify-center min-h-[80px] shadow-sm">
                    {capability}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ARCHITECTURE & SECURITY */}
        <TabsContent value="architecture" className="space-y-6 print:block">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Security Architecture
              </CardTitle>
              <CardDescription>
                Strict separation of concerns to protect sensitive API credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-sm leading-relaxed">
                  <p>
                    Real AI integration requires backend API routes. <strong>API keys must stay server-side only</strong> in the <code className="bg-muted px-1.5 py-0.5 rounded">/apps/api/.env</code> file.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Environment variables containing API keys are <strong>NOT</strong> exposed to the frontend build.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>The frontend React application <strong>never</strong> calls external AI APIs directly.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>The backend (Express.js) handles all external API calls, rate limiting, and error handling.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>The frontend communicates exclusively with our secure backend routes.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border border-border">
                    <div className="bg-muted px-4 py-2 text-xs font-semibold border-b border-border flex justify-between items-center">
                      <span>/apps/api/.env (SERVER-SIDE ONLY)</span>
                      <Badge variant="destructive" className="text-[10px]">Secret</Badge>
                    </div>
                    <pre className="p-4 bg-zinc-950 text-zinc-50 text-xs overflow-x-auto">
                      <code>
{`# AI Provider API Keys
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...`}
                      </code>
                    </pre>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-border">
                    <div className="bg-muted px-4 py-2 text-xs font-semibold border-b border-border flex justify-between items-center">
                      <span>Frontend Implementation (SAFE)</span>
                      <Badge variant="secondary" className="text-[10px]">Public</Badge>
                    </div>
                    <pre className="p-4 bg-zinc-950 text-zinc-50 text-xs overflow-x-auto">
                      <code>
{`// Frontend calls our backend, NEVER the AI provider
const generateDraft = async (prompt) => {
  const response = await fetch('/api/ai/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  return response.json();
};`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-500" />
                Possible Future Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                  <h3 className="font-bold mb-1">OpenAI</h3>
                  <p className="text-xs text-muted-foreground">GPT-4o, GPT-3.5-Turbo. Industry standard for general text generation and reasoning.</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                  <h3 className="font-bold mb-1">Anthropic</h3>
                  <p className="text-xs text-muted-foreground">Claude 3.5 Sonnet/Opus. Excellent for large context windows and nuanced writing.</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                  <h3 className="font-bold mb-1">Google Gemini</h3>
                  <p className="text-xs text-muted-foreground">Gemini 1.5 Pro/Flash. Strong multimodal capabilities and fast inference.</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                  <h3 className="font-bold mb-1">Local Models</h3>
                  <p className="text-xs text-muted-foreground">Ollama, LLaMA 3. Maximum privacy and zero recurring API costs, requires hosting.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: IMPLEMENTATION ROADMAP */}
        <TabsContent value="implementation" className="space-y-6 print:block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-500" />
                  Suggested Future Backend Routes
                </CardTitle>
                <CardDescription>
                  API endpoints to be built in the Express.js backend.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="route-1">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">POST</Badge>
                        /api/ai/generate-content
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                      <p><strong>Input:</strong> content type, campaign/project context, tone</p>
                      <p><strong>Output:</strong> generated content draft</p>
                      <p><strong>Purpose:</strong> Creates initial drafts for blogs, social posts, and newsletters based on master content.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="route-2">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">POST</Badge>
                        /api/ai/repurpose-content
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                      <p><strong>Input:</strong> original content, target format</p>
                      <p><strong>Output:</strong> repurposed content</p>
                      <p><strong>Purpose:</strong> Transforms a long-form blog post into a Twitter thread, LinkedIn post, or newsletter.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="route-3">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">POST</Badge>
                        /api/ai/summarize-campaign
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                      <p><strong>Input:</strong> campaign data, related content metrics</p>
                      <p><strong>Output:</strong> campaign summary and insights</p>
                      <p><strong>Purpose:</strong> Generates executive summaries of campaign performance and identifies gaps.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="route-4">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">POST</Badge>
                        /api/ai/draft-follow-up
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                      <p><strong>Input:</strong> contact/press data, last interaction notes</p>
                      <p><strong>Output:</strong> suggested follow-up message</p>
                      <p><strong>Purpose:</strong> Drafts personalized email templates for PR outreach and investor relations.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="route-5" className="border-b-0">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">POST</Badge>
                        /api/ai/analyze-brand-voice
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                      <p><strong>Input:</strong> existing content samples</p>
                      <p><strong>Output:</strong> brand voice analysis and guidelines</p>
                      <p><strong>Purpose:</strong> Analyzes past successful content to ensure future AI generations match the brand's unique tone.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-emerald-500" />
                  Implementation Steps
                </CardTitle>
                <CardDescription>
                  Step-by-step process for future integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {[
                    { step: 1, title: 'Enable API Server Integration', desc: 'Ensure the Express.js backend is fully configured and communicating with the frontend.' },
                    { step: 2, title: 'Choose AI Provider & Get Key', desc: 'Select primary provider (e.g., OpenAI) and generate production API keys.' },
                    { step: 3, title: 'Secure Credentials', desc: 'Add API key to /apps/api/.env. Verify it is excluded from version control.' },
                    { step: 4, title: 'Create Backend Routes', desc: 'Implement the suggested routes in /apps/api/routes/ with proper error handling.' },
                    { step: 5, title: 'Update Smart Assistant', desc: 'Modify frontend panels to call backend routes instead of local rule engine.' },
                    { step: 6, title: 'End-to-End Testing', desc: 'Test generation, repurposing, and error states across all modules.' },
                    { step: 7, title: 'Monitor Usage & Costs', desc: 'Implement logging to track token usage and optimize prompts.' }
                  ].map((item, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-muted-foreground font-bold text-xs shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {item.step}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                        <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIIntegrationPlan;