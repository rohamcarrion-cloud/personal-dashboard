import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CredentialStatus from './CredentialStatus.jsx';
import TestConnectionButton from './TestConnectionButton.jsx';
import DisconnectButton from './DisconnectButton.jsx';
import { KeyRound } from 'lucide-react';

export default function CredentialsTable({ credentials, section, onTest, onDisconnect, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!credentials || credentials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-xl bg-muted/10">
        <KeyRound className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground text-center">No credentials configured for this section.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Service / Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell className="font-medium">{cred.name}</TableCell>
                <TableCell>
                  <CredentialStatus 
                    status={cred.status} 
                    accountName={cred.accountName} 
                    lastTested={cred.lastTested}
                    errorMessage={cred.errorMessage}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TestConnectionButton service={cred.id} onTest={onTest} />
                    {cred.status !== 'not-connected' && (
                      <DisconnectButton service={cred.id} onDisconnect={onDisconnect} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {credentials.map((cred) => (
          <Card key={cred.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">{cred.name}</h4>
              </div>
              <CredentialStatus 
                status={cred.status} 
                accountName={cred.accountName} 
                lastTested={cred.lastTested}
                errorMessage={cred.errorMessage}
              />
              <div className="flex gap-2 pt-2 border-t border-border">
                <TestConnectionButton service={cred.id} onTest={onTest} className="flex-1" />
                {cred.status !== 'not-connected' && (
                  <DisconnectButton service={cred.id} onDisconnect={onDisconnect} className="flex-1" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}