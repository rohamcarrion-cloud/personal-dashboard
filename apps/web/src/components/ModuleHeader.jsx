import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

export default function ModuleHeader({ 
  title, 
  description, 
  searchPlaceholder, 
  searchTerm,
  onSearch, 
  primaryActionLabel, 
  onPrimaryAction, 
  secondaryActions 
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {onSearch && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || "Search..."}
              value={searchTerm || ''}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9 bg-background border-border hover:border-primary/50 focus-visible:border-primary transition-colors rounded-xl w-full"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {secondaryActions}
          {onPrimaryAction && primaryActionLabel && (
            <Button onClick={onPrimaryAction} className="rounded-xl shadow-sm w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> {primaryActionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}