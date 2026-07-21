import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export default function DisconnectConfirmation({ isOpen, onClose, account, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDisconnect = async () => {
    if (!account) return;
    
    setIsDeleting(true);
    try {
      const response = await apiServerClient.fetch(`/social/accounts/${account.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to disconnect account');
      }

      toast.success('Account disconnected successfully');
      onConfirm();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred while disconnecting');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to disconnect {account?.accountName}? This will remove the access token and you will no longer be able to publish to this account until you reconnect it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDisconnect();
            }} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? 'Disconnecting...' : 'Disconnect'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}