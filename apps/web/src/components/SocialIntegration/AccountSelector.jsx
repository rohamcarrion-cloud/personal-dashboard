import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export default function AccountSelector({ platform, selectedAccounts, onChange }) {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && platform) {
      setLoading(true);
      pb.collection('social_accounts').getList(1, 50, {
        filter: `platform="${platform}" && userId="${currentUser.id}" && isConnected=true`,
        sort: '-created',
        $autoCancel: false
      }).then(res => {
        setAccounts(res.items);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch accounts for selector:', err);
        setLoading(false);
      });
    }
  }, [currentUser, platform]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-900/50">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <p>No {platform === 'linkedin' ? 'LinkedIn' : platform} account connected. Please connect an account in Social Integration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[240px] overflow-y-auto p-1 scrollbar-thin">
      {accounts.map(acc => (
        <div 
          key={acc.id} 
          className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-xl border border-border transition-colors cursor-pointer"
          onClick={() => {
            if (selectedAccounts.includes(acc.id)) {
              onChange(selectedAccounts.filter(id => id !== acc.id));
            } else {
              onChange([...selectedAccounts, acc.id]);
            }
          }}
        >
          <Checkbox 
            id={`acc-${acc.id}`} 
            checked={selectedAccounts.includes(acc.id)}
            onCheckedChange={(checked) => {
              if (checked) onChange([...selectedAccounts, acc.id]);
              else onChange(selectedAccounts.filter(id => id !== acc.id));
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 flex flex-col">
            <label htmlFor={`acc-${acc.id}`} className="text-sm font-medium leading-none cursor-pointer">
              {acc.accountName}
            </label>
            <span className="text-xs text-muted-foreground mt-1">@{acc.username}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Connected</span>
          </div>
        </div>
      ))}
    </div>
  );
}