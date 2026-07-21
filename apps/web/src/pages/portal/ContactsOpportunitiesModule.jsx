import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Users, Building, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ContactForm from '@/components/forms/ContactForm.jsx';
import { format } from 'date-fns';
import FollowUpSuggestionsPanel from '@/components/FollowUpSuggestionsPanel.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';

const ContactsOpportunitiesModule = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, typeFilter]);

  const fetchContacts = async () => {
    try {
      let filter = '';
      const filters = [];
      if (searchTerm) filters.push(`(name ~ "${searchTerm}" || organization ~ "${searchTerm}" || email ~ "${searchTerm}")`);
      if (typeFilter !== 'all') filters.push(`contactType = "${typeFilter}"`);
      if (filters.length > 0) filter = filters.join(' && ');

      const records = await pb.collection('contacts_opportunities').getFullList({ filter, sort: '-created', $autoCancel: false });
      setContacts(records);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load contacts');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await pb.collection('contacts_opportunities').delete(id, { $autoCancel: false });
      toast.success('Contact deleted');
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedContact(null);
    fetchContacts();
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Contacts & Opportunities" 
        description="Manage your network, leads, and professional relationships."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search contacts..."
        primaryActionLabel="New Contact"
        onPrimaryAction={() => { setSelectedContact(null); setDialogOpen(true); }}
        secondaryActions={
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-background rounded-xl">
              <SelectValue placeholder="Contact Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Investor">Investor</SelectItem>
              <SelectItem value="Reporter">Reporter</SelectItem>
              <SelectItem value="Sponsor">Sponsor</SelectItem>
              <SelectItem value="Partner">Partner</SelectItem>
              <SelectItem value="Client Lead">Client Lead</SelectItem>
              <SelectItem value="General Contact">General Contact</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <FollowUpSuggestionsPanel />

      {contacts.length === 0 ? (
        <EmptyState 
          icon={Users}
          title="No contacts found"
          description="Create your first contact to get started tracking relationships."
          actionLabel="Create Contact"
          onAction={() => { setSelectedContact(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="group hover:shadow-md transition-all duration-300 border-border overflow-hidden flex flex-col rounded-lg shadow-sm">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={contact.relationshipStatus || 'New'} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => { setSelectedContact(contact); setDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(contact.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold leading-tight truncate mb-1">{contact.name}</h3>
                <p className="text-sm text-primary font-medium mb-4">{contact.contactType || 'General Contact'}</p>
                
                <div className="space-y-2 flex-1 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2"><Building className="w-4 h-4" /> <span className="truncate">{contact.organization || '-'}</span></div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> <span className="truncate">{contact.email || '-'}</span></div>
                </div>
                
                <div className="pt-3 border-t border-border mt-auto flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground"><Clock className="w-4 h-4 mr-1.5" /> Follow-up</span>
                  <span className="font-medium">{contact.followUpDate ? format(new Date(contact.followUpDate), 'MMM d, yyyy') : '-'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedContact ? 'Edit Contact' : 'Create Contact'}</DialogTitle></DialogHeader>
          <ContactForm contact={selectedContact} onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsOpportunitiesModule;