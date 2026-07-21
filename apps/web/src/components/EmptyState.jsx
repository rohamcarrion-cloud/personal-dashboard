import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="text-center py-20 bg-card border border-border border-dashed rounded-3xl shadow-sm flex flex-col items-center justify-center">
      {Icon && <Icon className="w-16 h-16 text-muted-foreground mb-4 opacity-40" />}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>}
      {onAction && actionLabel && (
        <Button onClick={onAction} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> {actionLabel}
        </Button>
      )}
    </div>
  );
}