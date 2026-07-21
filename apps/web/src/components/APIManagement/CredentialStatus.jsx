import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export default function CredentialStatus({ status, accountName, lastTested, errorMessage }) {
  const isConnected = status === 'connected';
  const isError = status === 'error';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Badge variant={isConnected ? 'default' : isError ? 'destructive' : 'secondary'} className={isConnected ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20' : ''}>
          {isConnected ? 'Connected' : isError ? 'Error' : 'Not Connected'}
        </Badge>
        {accountName && <span className="text-sm font-medium">{accountName}</span>}
      </div>
      {lastTested && (
        <span className="text-xs text-muted-foreground">
          Tested: {new Date(lastTested).toLocaleString()}
        </span>
      )}
      {isError && errorMessage && (
        <div className="flex items-center gap-1 text-xs text-destructive mt-1">
          <AlertCircle className="w-3 h-3" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}