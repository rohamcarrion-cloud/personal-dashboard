import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Target, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('campaigns').getFullList({
        sort: '-startDate',
        $autoCancel: false
      });
      
      // Fetch master content to get counts
      const masterContents = await pb.collection('master_content').getFullList({
        fields: 'id,campaignId',
        $autoCancel: false
      });

      const campaignsWithCounts = records.map(camp => {
        const count = masterContents.filter(mc => mc.campaignId === camp.id).length;
        return { ...camp, contentCount: count };
      });

      setCampaigns(campaignsWithCounts);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'Completed': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'Planning': return 'bg-amber-500/10 text-amber-700 border-amber-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-64 w-full rounded-2xl" /></div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-2xl border border-border">
        <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground font-medium">No campaigns created yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {campaigns.map(campaign => (
        <div 
          key={campaign.id} 
          className="bg-card hover:bg-accent/50 transition-colors border border-border rounded-2xl p-5 flex flex-col group cursor-pointer"
          onClick={() => navigate(`/portal/command-center/campaigns/${campaign.id}`)}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {campaign.name}
              </h3>
              <Badge variant="outline" className={`mt-2 ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </Badge>
            </div>
            <div className="flex flex-col items-end text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{campaign.contentCount}</span>
              <span className="text-xs">Assets</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
            {campaign.objective}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border mt-auto">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(campaign.startDate), 'MMM d')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampaignsList;