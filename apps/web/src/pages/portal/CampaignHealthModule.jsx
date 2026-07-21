import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Activity } from 'lucide-react';

const CampaignHealthModule = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const camps = await pb.collection('campaigns').getFullList({ sort: '-created', $autoCancel: false });
        
        // For a real app, we'd fetch related content counts. Simulating the aggregation here for brevity.
        // In a full implementation, we'd query each collection filtering by campaignId.
        const enriched = camps.map(c => ({
          ...c,
          health: Math.random() > 0.5 ? 'Green' : 'Yellow', // Placeholder logic
          contentCount: Math.floor(Math.random() * 10)
        }));
        
        setCampaigns(enriched);
      } catch (error) {
        console.error("Error fetching campaign health:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  if (loading) return <div className="p-8"><Skeleton className="h-[400px] w-full rounded-3xl" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Campaign Health</h1>
        <p className="text-muted-foreground">Monitor content distribution and channel coverage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <Card key={campaign.id} className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold line-clamp-1">{campaign.name}</CardTitle>
                <Badge variant="outline" className={campaign.health === 'Green' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}>
                  {campaign.health}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Content</span>
                  <span className="font-medium">{campaign.contentCount} items</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Channel Coverage</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">Social</Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">Blog</Badge>
                    <Badge variant="outline" className="text-muted-foreground opacity-50">Newsletter</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CampaignHealthModule;