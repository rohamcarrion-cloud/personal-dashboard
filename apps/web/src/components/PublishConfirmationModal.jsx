import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Send } from 'lucide-react';

export default function PublishConfirmationModal({
  isOpen, 
  onClose, 
  onConfirm, 
  post, 
  platforms = [], 
  accounts = [], 
  selectedPlatforms = [], 
  selectedAccounts = {}, 
  onPlatformChange, 
  onAccountChange, 
  isPublishing
}) {
  if (!post) return null;

  const handlePlatformToggle = (platform, checked) => {
    if (checked) {
      onPlatformChange([...selectedPlatforms, platform]);
      // Auto-select first available account if exists
      const availableAccounts = accounts.filter(a => a.platform === platform && ['valid', 'connected'].includes(a.tokenStatus));
      if (availableAccounts.length > 0 && !selectedAccounts[platform]) {
        onAccountChange({ ...selectedAccounts, [platform]: availableAccounts[0].id });
      }
    } else {
      onPlatformChange(selectedPlatforms.filter(p => p !== platform));
      const newAccounts = { ...selectedAccounts };
      delete newAccounts[platform];
      onAccountChange(newAccounts);
    }
  };

  const handleAccountSelect = (platform, accountId) => {
    if (accountId === 'none') return;
    onAccountChange({ ...selectedAccounts, [platform]: accountId });
  };

  // Check if all selected platforms have an account selected
  const hasMissingAccounts = selectedPlatforms.some(p => !selectedAccounts[p] || selectedAccounts[p] === 'none');
  const canPublish = selectedPlatforms.length > 0 && !hasMissingAccounts && !isPublishing;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isPublishing && !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Publish Post
          </DialogTitle>
          <DialogDescription>
            Select the platforms and accounts where you want to publish "{post.title}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Select Platforms & Accounts</h4>
            
            {platforms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No platforms available.</p>
            ) : (
              <div className="space-y-3 border border-border rounded-xl p-4 bg-muted/30">
                {platforms.map(platform => {
                  const isSelected = selectedPlatforms.includes(platform);
                  const platformAccounts = accounts.filter(a => a.platform === platform && ['valid', 'connected'].includes(a.tokenStatus));
                  const hasAccounts = platformAccounts.length > 0;

                  return (
                    <div key={platform} className="flex flex-col gap-2 pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`platform-${platform}`} 
                          checked={isSelected}
                          onCheckedChange={(checked) => handlePlatformToggle(platform, checked)}
                        />
                        <label 
                          htmlFor={`platform-${platform}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                        >
                          {platform === 'youtube' ? 'YouTube Shorts' : platform}
                        </label>
                      </div>
                      
                      {isSelected && (
                        <div className="pl-6 animate-in fade-in slide-in-from-top-1">
                          {hasAccounts ? (
                            <Select 
                              value={selectedAccounts[platform] || 'none'} 
                              onValueChange={(val) => handleAccountSelect(platform, val)}
                            >
                              <SelectTrigger className="h-8 text-xs w-full bg-background">
                                <SelectValue placeholder="Select an account..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none" disabled className="hidden">Select an account...</SelectItem>
                                {platformAccounts.map(acc => (
                                  <SelectItem key={acc.id} value={acc.id} className="text-xs">
                                    {acc.accountName} (@{acc.username})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>No connected account for this platform.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPublishing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!canPublish}>
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}