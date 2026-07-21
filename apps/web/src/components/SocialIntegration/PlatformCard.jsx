import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link as LinkIcon, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import DisconnectButton from './DisconnectButton.jsx';
import { connectToOAuth } from './OAuthConnector.jsx';
import { testConnection } from './TestConnection.jsx';

export default function PlatformCard({ 
  platform, 
  icon: Icon, 
  status, 
  accountName, 
  lastTested, 
  onUpdate,
  isLoading: initialLoading 
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectToOAuth(platform.toLowerCase());
    } catch (error) {
      setIsConnecting(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await testConnection(platform.toLowerCase());
      if (onUpdate) onUpdate(platform, { status: 'connected', lastTested: new Date().toISOString(), accountName: result.accountName || accountName });
    } catch (error) {
      if (onUpdate) onUpdate(platform, { status: 'error' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    if (onUpdate) onUpdate(platform, { status: 'not-connected', accountName: null, lastTested: null });
  };

  const isConnected = status === 'connected';
  const isError = status === 'error';
  const isLoading = initialLoading || isConnecting || isTesting;

  return (
    <Card className="border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <CardTitle className="text-lg">{platform}</CardTitle>
        </div>
        <Badge variant={isConnected ? 'default' : isError ? 'destructive' : 'secondary'} className={isConnected ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20' : ''}>
          {isConnected ? 'Connected' : isError ? 'Error' : 'Not Connected'}
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {isConnected || isError ? (
          <>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{accountName || 'Unknown Account'}</p>
              {lastTested && (
                <p className="text-xs text-muted-foreground">
                  Last tested: {new Date(lastTested).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={handleTest} disabled={isLoading}>
                {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Test Connection
              </Button>
              <DisconnectButton platform={platform.toLowerCase()} onDisconnect={handleDisconnect} isLoading={isLoading} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted-foreground">Connect your account to enable publishing and analytics.</p>
            <Button onClick={handleConnect} disabled={isLoading} className="w-full sm:w-auto">
              {isConnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
              Connect Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}