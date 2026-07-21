import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const GrowthOpportunitiesModule = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const records = await pb.collection('contacts_opportunities').getFullList({
          filter: 'contactType ~ "Investor" || contactType ~ "Sponsor" || contactType ~ "Partner" || contactType ~ "Reporter" || contactType ~ "Podcast Guest"',
          sort: 'followUpDate,-created',
          $autoCancel: false,
        });
        setOpportunities(records);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpps();
  }, []);

  if (loading) return <div className="p-8"><Skeleton className="h-[400px] w-full rounded-3xl" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Growth Opportunities</h1>
        <p className="text-muted-foreground">Manage high-value contacts and strategic relationships.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map(opp => (
          <Card key={opp.id} className="border-border shadow-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">{opp.contactType}</Badge>
                {opp.opportunityValue > 0 && (
                  <span className="text-sm font-bold text-green-600">${opp.opportunityValue.toLocaleString()}</span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-1">{opp.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{opp.organization || 'Independent'}</p>
              
              {opp.followUpDate && (
                <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Follow-up: {format(new Date(opp.followUpDate), 'MMM d, yyyy')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {opportunities.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No growth opportunities found.
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowthOpportunitiesModule;