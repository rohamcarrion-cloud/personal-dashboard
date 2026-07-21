import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function APIManagement() {
  const { currentUser } = useAuth();
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock AI providers for demonstration since they aren't in the schema yet
  const aiProviders = [
    { id: 'openai', name: 'OpenAI', status: 'connected', lastUsed: new Date().toISOString() },
    { id: 'anthropic', name: 'Anthropic', status: 'not-connected', lastUsed: null },
    { id: 'gemini', name: 'Google Gemini', status: 'not-connected', lastUsed: null }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchSocialAccounts();
    }
  }, [currentUser]);

  const fetchSocialAccounts = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('social_accounts').getFullList({
        filter: `userId="${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setSocialAccounts(records);
    } catch (error) {
      console.error('Failed to fetch social accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'valid' || status === 'connected') {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Connected</Badge>;
    }
    if (status === 'expiring') {
      return <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600"><AlertCircle className="w-3 h-3 mr-1"/> Expiring</Badge>;
    }
    if (status === 'expired' || status === 'revoked' || status === 'disconnected' || status === 'error') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Error</Badge>;
    }
    return <Badge variant="outline">Not Connected</Badge>;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="API Management" 
        description="Manage your API connections, credentials, and third-party integrations."
      />

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="social">Social Platforms</TabsTrigger>
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="social" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Social Media Connections</h3>
              <p className="text-sm text-muted-foreground">Manage OAuth connections for automated publishing.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/portal/command-center/social-integration">
                Manage Connections <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
            ) : socialAccounts.length === 0 ? (
              <Card className="col-span-full bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-4">No social accounts connected.</p>
                  <Button asChild>
                    <Link to="/portal/command-center/social-integration">Connect Accounts</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              socialAccounts.map(account => (
                <Card key={account.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">{account.platform}</CardTitle>
                      {getStatusBadge(account.tokenStatus)}
                    </div>
                    <CardDescription>@{account.username}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Label: <span className="font-medium text-foreground">{account.accountName}</span>
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">AI Model Providers</h3>
              <p className="text-sm text-muted-foreground">Configure API keys for content generation.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/portal/command-center/ai-workspace">
                AI Workspace <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiProviders.map(provider => (
              <Card key={provider.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                    {getStatusBadge(provider.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Status: {provider.status === 'connected' ? 'Active and ready' : 'Requires API Key'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}