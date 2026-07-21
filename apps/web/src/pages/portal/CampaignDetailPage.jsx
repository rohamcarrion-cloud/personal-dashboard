import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Target, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CampaignRecommendationsPanel from '@/components/CampaignRecommendationsPanel.jsx';

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const record = await pb.collection('campaigns').getOne(id, { $autoCancel: false });
        setCampaign(record);
      } catch (error) {
        toast.error('Failed to load campaign details');
        navigate('/portal/command-center/campaigns');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id, navigate]);

  if (loading) return <div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>;
  if (!campaign) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/portal/command-center/campaigns"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{campaign.status}</Badge>
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {format(new Date(campaign.startDate), 'MMM d, yyyy')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <CampaignRecommendationsPanel />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-primary" /> Objective</h3>
          <p className="text-muted-foreground">{campaign.objective}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-primary" /> Target Audience</h3>
          <p className="text-muted-foreground">{campaign.targetAudience}</p>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;