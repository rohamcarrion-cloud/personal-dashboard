import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Target, ArrowRight, Calendar, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import CampaignForm from '@/components/forms/CampaignForm.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import { format } from 'date-fns';
import CampaignRecommendationsPanel from '@/components/CampaignRecommendationsPanel.jsx';

const CampaignsModule = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => { fetchCampaigns(); }, [searchTerm, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      let filter = '';
      const filters = [];
      if (searchTerm) filters.push(`name ~ "${searchTerm}"`);
      if (statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
      if (filters.length > 0) filter = filters.join(' && ');

      const records = await pb.collection('campaigns').getFullList({ filter, sort: '-created', $autoCancel: false });
      setCampaigns(records);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load campaigns');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await pb.collection('campaigns').delete(id, { $autoCancel: false });
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleFormSuccess = () => { setDialogOpen(false); setSelectedCampaign(null); fetchCampaigns(); };

  if (loading) return <div className="module-container"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;

  return (
    <div className="module-container">
      <ModuleHeader 
        title="Campaigns" 
        description="Plan, track, and measure your marketing initiatives."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search campaigns..."
        primaryActionLabel="New Campaign"
        onPrimaryAction={() => { setSelectedCampaign(null); setDialogOpen(true); }}
        secondaryActions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-background rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <CampaignRecommendationsPanel />

      {campaigns.length === 0 ? (
        <EmptyState 
          icon={Target}
          title="No campaigns found"
          description="Create your first campaign to start organizing your marketing efforts."
          actionLabel="Create Campaign"
          onAction={() => { setSelectedCampaign(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="group hover:shadow-md transition-all duration-300 border-border overflow-hidden flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={campaign.status} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => { setSelectedCampaign(campaign); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(campaign.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <Link to={`/portal/command-center/campaigns/${campaign.id}`} className="block mb-2 group-hover:text-primary transition-colors">
                  <h3 className="text-xl font-bold leading-tight line-clamp-2">{campaign.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">{campaign.objective || 'No objective defined.'}</p>
                <div className="space-y-3 pt-4 border-t border-border mt-auto">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 opacity-70" />
                    {campaign.startDate ? format(new Date(campaign.startDate), 'MMM d') : '-'} {' → '} {campaign.endDate ? format(new Date(campaign.endDate), 'MMM d, yyyy') : '-'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BarChart className="w-4 h-4 mr-2 opacity-70" />
                    <span className="truncate">{campaign.targetAudience || 'General Audience'}</span>
                  </div>
                </div>
                <Button asChild variant="secondary" className="w-full mt-6 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to={`/portal/command-center/campaigns/${campaign.id}`}>View Details <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle></DialogHeader>
          <CampaignForm initialData={selectedCampaign} onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsModule;