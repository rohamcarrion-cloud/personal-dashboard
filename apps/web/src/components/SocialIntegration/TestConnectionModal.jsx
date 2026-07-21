import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';

export default function TestConnectionModal({ isOpen, onClose, account, onComplete }) {
  const [status, setStatus] = useState('idle'); // idle, testing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && account && status === 'idle') {
      runTest();
    }
  }, [isOpen, account]);

  const runTest = async () => {
    setStatus('testing');
    try {
      const response = await apiServerClient.fetch('/social/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed');
      }

      setStatus(data.success ? 'success' : 'error');
      setMessage(data.message || (data.success ? 'Connection healthy' : 'Connection failed'));
      
      if (onComplete) {
        onComplete(data);
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(error.message || 'An unexpected error occurred');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setMessage('');
    onClose();
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && status !== 'testing' && handleClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Testing Connection</DialogTitle>
          <DialogDescription>
            Verifying access token for {account.accountName} ({account.platform})
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          {status === 'testing' && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm font-medium">Communicating with platform API...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-600">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-destructive" />
              <p className="text-sm font-medium text-destructive">{message}</p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} disabled={status === 'testing'}>
            {status === 'testing' ? 'Please wait...' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}