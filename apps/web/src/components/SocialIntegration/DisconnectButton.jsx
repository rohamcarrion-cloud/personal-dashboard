import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';
import { Loader2, Unplug } from 'lucide-react';

export default function DisconnectButton({ platform, onDisconnect, isLoading }) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await apiServerClient.fetch(`/social/disconnect/${platform}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }
      
      toast.success(`Disconnected from ${platform}`);
      if (onDisconnect) onDisconnect(platform);
    } catch (error) {
      toast.error(error.message || `Failed to disconnect ${platform}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={isLoading || isDisconnecting}>
          {isDisconnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Unplug className="w-4 h-4 mr-2" />}
          Disconnect
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect {platform}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the connection to your {platform} account. You will need to re-authorize the application to publish posts again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}