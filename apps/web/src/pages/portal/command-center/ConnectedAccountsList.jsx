import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Linkedin, RefreshCw, Trash2, Link2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function ConnectedAccountsList() {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Action states
  const [isTesting, setIsTesting] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchAccounts();
    }
  }, [currentUser]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      // Task 1: Fetch social_accounts where platform='linkedin'
      const records = await pb.collection('social_accounts').getList(1, 50, {
        filter: `platform="linkedin" && userId="${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setAccounts(records.items);
    } catch (error) {
      console.error('Failed to fetch social accounts:', error);
      toast.error('Failed to load connected accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (accountId) => {
    setIsTesting(true);
    const toastId = toast.loading('Testing connection...');
    try {
      const response = await apiServerClient.fetch('/linkedin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed');
      }

      toast.success('Connection successful!', { id: toastId });
      fetchAccounts(); // Refresh to update lastUsed
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to test connection', { id: toastId });
      fetchAccounts(); // Refresh to show error status if updated by backend
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedAccount) return;
    setIsDisconnecting(true);
    const toastId = toast.loading('Disconnecting account...');
    
    try {
      const response = await apiServerClient.fetch('/linkedin/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selectedAccount.id })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      toast.success('Account disconnected successfully', { id: toastId });
      setDisconnectModalOpen(false);
      fetchAccounts();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to disconnect account', { id: toastId });
    } finally {
      setIsDisconnecting(false);
      setSelectedAccount(null);
    }
  };

  const getStatusBadge = (isConnected, tokenStatus) => {
    if (!isConnected || tokenStatus === 'expired' || tokenStatus === 'revoked' || tokenStatus === 'error') {
      return <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0">Disconnected</Badge>;
    }
    return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">Connected</Badge>;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Connected Accounts" 
        description="Manage your connected LinkedIn profiles for automated publishing."
      />

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Tested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-48 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mb-3 opacity-20" />
                    <p className="mb-4">No LinkedIn account connected.</p>
                    <Button asChild variant="default">
                      <Link to="/portal/command-center/social-integration">
                        <Link2 className="w-4 h-4 mr-2" /> Connect LinkedIn
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-[#0A66C2]">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {account.accountName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    @{account.username}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(account.isConnected, account.tokenStatus)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.lastUsed ? format(new Date(account.lastUsed), 'MMM d, yyyy HH:mm') : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleTestConnection(account.id)}
                        disabled={isTesting}
                      >
                        <RefreshCw className={`w-3 h-3 mr-2 ${isTesting ? 'animate-spin' : ''}`} /> Test Connection
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => {
                          setSelectedAccount(account);
                          setDisconnectModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-2" /> Disconnect
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {selectedAccount?.accountName}? This will prevent future automated publishing to this account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDisconnectModalOpen(false)} disabled={isDisconnecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={isDisconnecting}>
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}