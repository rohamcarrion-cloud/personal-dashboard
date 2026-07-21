import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Mail, Users, Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';
import NewsletterForm from '@/components/forms/NewsletterForm.jsx';
import { format } from 'date-fns';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';

const NewsletterModule = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [searchTerm, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      let filter = '';
      const filters = [];
      if (searchTerm) filters.push(`title ~ "${searchTerm}"`);
      if (statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
      if (filters.length > 0) filter = filters.join(' && ');

      const records = await pb.collection('newsletter_campaigns').getFullList({ filter, sort: '-created', $autoCancel: false });
      setCampaigns(records);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load newsletter campaigns');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await pb.collection('newsletter_campaigns').delete(id, { $autoCancel: false });
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedCampaign(null);
    fetchCampaigns();
  };

  if (loading) return <div className="space-y-4 max-w-7xl mx-auto"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Newsletter" 
        description="Draft, schedule, and manage your email campaigns."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search campaigns..."
        primaryActionLabel="New Newsletter"
        onPrimaryAction={() => { setSelectedCampaign(null); setDialogOpen(true); }}
        secondaryActions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-background rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState 
          icon={Mail}
          title="No campaigns found"
          description="Create your first newsletter campaign to engage your audience."
          actionLabel="Create Campaign"
          onAction={() => { setSelectedCampaign(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="group hover:shadow-md transition-all duration-300 border-border overflow-hidden flex flex-col rounded-lg shadow-sm">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={campaign.status} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => { setSelectedCampaign(campaign); setDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(campaign.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold leading-tight line-clamp-2 mb-2">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                  {campaign.subjectLine || 'No subject line provided.'}
                </p>
                
                <div className="space-y-3 pt-4 border-t border-border mt-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-1.5 opacity-70" /> Audience
                    </span>
                    <span className="font-medium truncate max-w-[120px]">{campaign.audience || 'All Subscribers'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground">
                      {campaign.status === 'Sent' ? <Send className="w-4 h-4 mr-1.5 opacity-70" /> : <Calendar className="w-4 h-4 mr-1.5 opacity-70" />}
                      {campaign.status === 'Sent' ? 'Sent' : 'Scheduled'}
                    </span>
                    <span className="font-medium">
                      {campaign.sentDate ? format(new Date(campaign.sentDate), 'MMM d, yyyy') : 
                       campaign.scheduledDate ? format(new Date(campaign.scheduledDate), 'MMM d, yyyy') : 
                       '-'}
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
            <DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
          </DialogHeader>
          <NewsletterForm campaign={selectedCampaign} onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsletterModule;