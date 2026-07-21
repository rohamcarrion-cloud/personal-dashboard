import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export default function ConnectAccountModal({ isOpen, onClose, platform, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [missingVars, setMissingVars] = useState([]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    setMissingVars([]);
    
    try {
      const response = await apiServerClient.fetch(`/social/oauth/authorize/${platform.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initialize connection');
      }

      if (data.missingVars && data.missingVars.length > 0) {
        setMissingVars(data.missingVars);
        setError(data.message || 'OAuth credentials not configured.');
        return;
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        onClose();
      } else if (data.message) {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to initialize connection: ${err.message}`);
      toast.error(err.message || 'OAuth configuration error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!platform) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect {platform.name}</DialogTitle>
          <DialogDescription>
            Authorize this application to publish content to your {platform.name} account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <platform.icon className="w-8 h-8 text-foreground" />
          </div>
          
          {missingVars.length > 0 ? (
            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <AlertCircle className="w-5 h-5" />
                <span>OAuth is not configured for this platform yet.</span>
              </div>
              <Card className="border-destructive/20 bg-destructive/5 shadow-none">
                <CardContent className="pt-4 space-y-4">
                  <p className="text-sm text-foreground">
                    Add these environment variables in <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded border">/apps/api/.env</code>:
                  </p>
                  <div className="flex flex-col gap-2">
                    {missingVars.map(v => (
                      <Badge key={v} variant="secondary" className="font-mono text-xs w-fit bg-background border">
                        {v}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground pt-2 border-t border-destructive/10">
                    See <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded border">/apps/api/OAUTH_SETUP.md</code> for setup instructions.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : error ? (
            <div className="w-full p-4 bg-destructive/10 text-destructive rounded-lg text-sm text-left space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click below to start the secure OAuth connection process. You will be redirected to {platform.name} to approve access.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {missingVars.length > 0 ? 'Close' : 'Cancel'}
          </Button>
          {missingVars.length === 0 && (
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                `Connect with ${platform.name}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}