import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Newspaper, Building2, User, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import PressMediaForm from '@/components/forms/PressMediaForm.jsx';
import { format } from 'date-fns';
import FollowUpSuggestionsPanel from '@/components/FollowUpSuggestionsPanel.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';

const PressMediaModule = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [searchTerm, statusFilter]);

  const fetchItems = async () => {
    try {
      let filter = '';
      const filters = [];
      if (searchTerm) filters.push(`(title ~ "${searchTerm}" || outlet ~ "${searchTerm}")`);
      if (statusFilter !== 'all') filters.push(`pitchStatus = "${statusFilter}"`);
      if (filters.length > 0) filter = filters.join(' && ');

      const records = await pb.collection('press_media').getFullList({ filter, sort: '-created', $autoCancel: false });
      setItems(records);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load press items');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this press item?')) return;
    try {
      await pb.collection('press_media').delete(id, { $autoCancel: false });
      toast.success('Press item deleted');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete press item');
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    fetchItems();
  };

  if (loading) return <div className="space-y-4 max-w-7xl mx-auto"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Press & Media" 
        description="Track pitches, media contacts, and published coverage."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search pitches or outlets..."
        primaryActionLabel="New Press Item"
        onPrimaryAction={() => { setSelectedItem(null); setDialogOpen(true); }}
        secondaryActions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-background rounded-xl">
              <SelectValue placeholder="Pitch Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Idea">Idea</SelectItem>
              <SelectItem value="Drafted">Drafted</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Followed Up">Followed Up</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <FollowUpSuggestionsPanel />

      {items.length === 0 ? (
        <EmptyState 
          icon={Newspaper}
          title="No press items found"
          description="Start tracking your media outreach by creating a new pitch."
          actionLabel="Create Pitch"
          onAction={() => { setSelectedItem(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-all duration-300 border-border overflow-hidden flex flex-col rounded-lg shadow-sm">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={item.pitchStatus} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => { setSelectedItem(item); setDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold leading-tight line-clamp-2 mb-4">{item.title}</h3>
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4 mr-2 opacity-70 shrink-0" />
                    <span className="truncate">{item.outlet || 'No outlet specified'}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2 opacity-70 shrink-0" />
                    <span className="truncate">{item.contactName || 'No contact specified'}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground">
                      <CalendarClock className="w-4 h-4 mr-1.5 opacity-70" /> Follow-up
                    </span>
                    <span className="font-medium">
                      {item.followUpDate ? format(new Date(item.followUpDate), 'MMM d, yyyy') : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Press Item' : 'Create Press Item'}</DialogTitle>
          </DialogHeader>
          <PressMediaForm item={selectedItem} onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PressMediaModule;