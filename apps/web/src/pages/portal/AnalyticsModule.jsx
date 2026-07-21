import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Share2, FolderKanban, PartyPopper, Users, Mail, Newspaper, MessageSquare, Image } from 'lucide-react';
import { format } from 'date-fns';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import RouteHealthSection from '@/components/RouteHealthSection.jsx';
import RelationshipHealthSection from '@/components/RelationshipHealthSection.jsx';
import DataHealthSection from '@/components/DataHealthSection.jsx';
import { PublishingFrequency, EngagementTrends, FailureRate } from '@/components/Analytics/SocialAnalyticsCharts.jsx';

const AnalyticsModule = () => {
  const [stats, setStats] = useState({});
  const [statusBreakdown, setStatusBreakdown] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const [blogPosts, socialPosts, projects, events, contacts, newsletter, press, submissions, mediaLib] = await Promise.all([
        pb.collection('blog_posts').getList(1, 1, { $autoCancel: false }),
        pb.collection('social_posts').getList(1, 1, { $autoCancel: false }),
        pb.collection('projects').getList(1, 1, { $autoCancel: false }),
        pb.collection('events').getList(1, 1, { $autoCancel: false }),
        pb.collection('contacts_opportunities').getList(1, 1, { $autoCancel: false }),
        pb.collection('newsletter_campaigns').getList(1, 1, { $autoCancel: false }),
        pb.collection('press_media').getList(1, 1, { $autoCancel: false }),
        pb.collection('contact_submissions').getList(1, 1, { $autoCancel: false }),
        pb.collection('media_library').getList(1, 1, { $autoCancel: false }),
      ]);

      setStats({
        blogPosts: blogPosts.totalItems, socialPosts: socialPosts.totalItems, projects: projects.totalItems,
        events: events.totalItems, contacts: contacts.totalItems, newsletter: newsletter.totalItems,
        press: press.totalItems, submissions: submissions.totalItems, media: mediaLib.totalItems,
      });

      const [blogByStatus, socialByStatus, projectsByStatus] = await Promise.all([
        pb.collection('blog_posts').getFullList({ $autoCancel: false }),
        pb.collection('social_posts').getFullList({ $autoCancel: false }),
        pb.collection('projects').getFullList({ $autoCancel: false })
      ]);

      const countStatus = (list) => list.reduce((acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc; }, {});

      setStatusBreakdown({ blog: countStatus(blogByStatus), social: countStatus(socialByStatus), projects: countStatus(projectsByStatus) });

      const allRecords = await Promise.all([
        pb.collection('blog_posts').getList(1, 20, { sort: '-created', $autoCancel: false }),
        pb.collection('social_posts').getList(1, 20, { sort: '-created', $autoCancel: false }),
        pb.collection('projects').getList(1, 20, { sort: '-created', $autoCancel: false }),
      ]);

      const activity = [
        ...allRecords[0].items.map(r => ({ ...r, type: 'Blog Post' })),
        ...allRecords[1].items.map(r => ({ ...r, type: 'Social Post' })),
        ...allRecords[2].items.map(r => ({ ...r, type: 'Project' })),
      ].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 20);

      setRecentActivity(activity); setLoading(false);
    } catch (error) { setLoading(false); }
  };

  const statCards = [
    { label: 'Blog Posts', value: stats.blogPosts, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Social Posts', value: stats.socialPosts, icon: Share2, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Projects', value: stats.projects, icon: FolderKanban, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: 'Events', value: stats.events, icon: PartyPopper, color: 'text-orange-600', bg: 'bg-orange-500/10' },
    { label: 'Contacts', value: stats.contacts, icon: Users, color: 'text-pink-600', bg: 'bg-pink-500/10' },
    { label: 'Newsletter', value: stats.newsletter, icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: 'Press & Media', value: stats.press, icon: Newspaper, color: 'text-teal-600', bg: 'bg-teal-500/10' },
    { label: 'Submissions', value: stats.submissions, icon: MessageSquare, color: 'text-red-600', bg: 'bg-red-500/10' },
    { label: 'Media Library', value: stats.media, icon: Image, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  ];

  if (loading) return <div className="space-y-6 max-w-7xl mx-auto"><Skeleton className="h-12 w-full" /><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(9)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader title="Analytics & Health" description="Overview of platform metrics, system health, and recent activity." />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-5 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="social">Social Publishing</TabsTrigger>
          <TabsTrigger value="routes">Route Health</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="data">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 outline-none">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="rounded-lg shadow-sm border-border overflow-hidden group hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${stat.bg}`}><Icon className={`w-5 h-5 ${stat.color}`} /></div>
                      <div><p className="text-2xl font-bold text-foreground leading-none">{stat.value || 0}</p><p className="text-xs text-muted-foreground mt-1">{stat.label}</p></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Blog', 'Social', 'Projects'].map((type) => (
              <Card key={type} className="rounded-lg shadow-sm border-border">
                <CardHeader className="pb-2 p-4 border-b border-border/50 bg-muted/10"><CardTitle className="text-base">{type} Status</CardTitle></CardHeader>
                <CardContent className="p-4">
                  {Object.keys(statusBreakdown[type.toLowerCase()] || {}).length === 0 ? <p className="text-muted-foreground text-sm">No data</p> : (
                    <div className="space-y-2">
                      {Object.entries(statusBreakdown[type.toLowerCase()]).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{status}</span><span className="font-semibold">{count}</span></div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader className="pb-2 p-4 border-b border-border/50 bg-muted/10"><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
            <CardContent className="p-4">
              {recentActivity.length === 0 ? <p className="text-muted-foreground text-sm">No recent activity</p> : (
                <div className="space-y-4">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{item.title}</p><p className="text-xs text-muted-foreground">{item.type} • {format(new Date(item.created), 'MMM d, yyyy h:mm a')}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PublishingFrequency />
            <FailureRate />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EngagementTrends />
          </div>
        </TabsContent>

        <TabsContent value="routes" className="outline-none">
          <RouteHealthSection />
        </TabsContent>

        <TabsContent value="relationships" className="outline-none">
          <RelationshipHealthSection />
        </TabsContent>

        <TabsContent value="data" className="outline-none">
          <DataHealthSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsModule;