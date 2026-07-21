import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, PartyPopper, Calendar, MapPin, Globe } from 'lucide-react';
import { toast } from 'sonner';
import EventForm from '@/components/forms/EventForm.jsx';
import { format } from 'date-fns';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';

const EventsModule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, statusFilter]);

  const fetchEvents = async () => {
    try {
      let filter = '';
      const filters = [];
      if (searchTerm) filters.push(`title ~ "${searchTerm}"`);
      if (statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
      if (filters.length > 0) filter = filters.join(' && ');

      const records = await pb.collection('events').getFullList({ filter, sort: '-date', $autoCancel: false });
      setEvents(records);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load events');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await pb.collection('events').delete(id, { $autoCancel: false });
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    fetchEvents();
  };

  if (loading) return <div className="space-y-4 max-w-7xl mx-auto"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Events" 
        description="Organize and track webinars, conferences, and speaking engagements."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search events..."
        primaryActionLabel="New Event"
        onPrimaryAction={() => { setSelectedEvent(null); setDialogOpen(true); }}
        secondaryActions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-background rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {events.length === 0 ? (
        <EmptyState 
          icon={PartyPopper}
          title="No events found"
          description="Create your first event to get started."
          actionLabel="Create Event"
          onAction={() => { setSelectedEvent(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="group hover:shadow-md transition-all duration-300 border-border overflow-hidden flex flex-col rounded-lg shadow-sm">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={event.status} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => { setSelectedEvent(event); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(event.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold leading-tight truncate mb-1">{event.title}</h3>
                <p className="text-sm text-primary font-medium mb-4">{event.eventType || 'Event'}</p>
                
                <div className="space-y-2 flex-1 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> <span>{format(new Date(event.date), 'MMM d, yyyy')} {event.startTime && `at ${event.startTime}`}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> <span className="truncate">{event.location || '-'}</span></div>
                </div>
                
                <div className="pt-3 border-t border-border mt-auto flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground"><Globe className="w-4 h-4 mr-1.5" /> Visibility</span>
                  <span className="font-medium">{event.publicVisibility ? 'Public' : 'Private'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedEvent ? 'Edit Event' : 'Create Event'}</DialogTitle></DialogHeader>
          <EventForm event={selectedEvent} onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsModule;