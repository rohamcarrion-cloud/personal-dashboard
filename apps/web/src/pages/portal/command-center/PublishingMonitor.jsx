import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, AlertCircle, CalendarClock, CheckCircle2, 
  Clock, FileText, Filter, RefreshCcw, Search, Eye, Send, Archive, XCircle, Linkedin, RefreshCw, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import PublishConfirmationModal from '@/components/PublishConfirmationModal.jsx';
import ActivityLogModal from '@/components/ActivityLogModal.jsx';

const PLATFORMS = ['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube'];

export default function PublishingMonitor() {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({ draft: 0, scheduled: 0, published: 0, failed: 0 });
  const [posts, setPosts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    platform: 'all',
    status: 'all',
    campaignId: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Action Modals State
  const [actionPost, setActionPost] = useState(null);
  const [actionType, setActionType] = useState(null); // 'publish', 'fail', 'archive'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishPlatforms, setPublishPlatforms] = useState([]);
  const [publishAccounts, setPublishAccounts] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);

  // Activity Log Modal State
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityPostId, setActivityPostId] = useState(null);

  // Platform Health States
  const [isTesting, setIsTesting] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchMetrics = async () => {
    try {
      const [draft, scheduled, published, failed] = await Promise.all([
        pb.collection('social_posts').getList(1, 1, { filter: 'status="Draft"', $autoCancel: false }),
        pb.collection('social_posts').getList(1, 1, { filter: 'status="Scheduled"', $autoCancel: false }),
        pb.collection('social_posts').getList(1, 1, { filter: 'status="Published"', $autoCancel: false }),
        pb.collection('social_posts').getList(1, 1, { filter: 'status="Failed"', $autoCancel: false }),
      ]);
      setMetrics({
        draft: draft.totalItems,
        scheduled: scheduled.totalItems,
        published: published.totalItems,
        failed: failed.totalItems
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchCampaignsAndAccounts = async () => {
    try {
      const [camps, accs] = await Promise.all([
        pb.collection('campaigns').getFullList({ sort: '-created', $autoCancel: false }),
        currentUser ? pb.collection('social_accounts').getFullList({ filter: `userId="${currentUser.id}"`, $autoCancel: false }) : Promise.resolve([])
      ]);
      setCampaigns(camps);
      setAccounts(accs);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let filterParts = [];
      
      if (filters.status !== 'all') {
        filterParts.push(`status="${filters.status}"`);
      }
      if (filters.campaignId !== 'all') {
        filterParts.push(`campaignId="${filters.campaignId}"`);
      }
      if (filters.dateFrom) {
        filterParts.push(`scheduledAt >= "${filters.dateFrom} 00:00:00"`);
      }
      if (filters.dateTo) {
        filterParts.push(`scheduledAt <= "${filters.dateTo} 23:59:59"`);
      }

      const filterString = filterParts.join(' && ');

      const records = await pb.collection('social_posts').getList(1, 50, {
        filter: filterString,
        sort: '-created',
        expand: 'campaignId,relatedProject',
        $autoCancel: false
      });

      let filteredPosts = records.items;
      
      if (filters.platform !== 'all') {
        filteredPosts = filteredPosts.filter(post => {
          const platformsStr = JSON.stringify(post.platforms || post.platformAccounts || {});
          return platformsStr.toLowerCase().includes(filters.platform.toLowerCase());
        });
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load social posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const records = await pb.collection('social_post_activity').getList(1, 50, {
        sort: '-timestamp,-created',
        expand: 'postId',
        $autoCancel: false
      });
      setActivities(records.items);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchCampaignsAndAccounts();
    fetchActivities();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      platform: 'all',
      status: 'all',
      campaignId: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      'Scheduled': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Published': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Failed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Archived': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    };

    return (
      <Badge variant="outline" className={`border-0 ${colors[status] || colors['Draft']}`}>
        {status || 'Unknown'}
      </Badge>
    );
  };

  const getHealthBadge = (isConnected, tokenStatus) => {
    if (!isConnected || tokenStatus === 'expired' || tokenStatus === 'revoked' || tokenStatus === 'error') {
      return <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0">Disconnected</Badge>;
    }
    return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">Connected</Badge>;
  };

  const handleTestConnection = async (accountId) => {
    setIsTesting(true);
    const toastId = toast.loading('Testing connection...');
    try {
      const response = await apiServerClient.fetch('/linkedin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed');
      }

      toast.success('Connection successful!', { id: toastId });
      fetchCampaignsAndAccounts();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to test connection', { id: toastId });
      fetchCampaignsAndAccounts();
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedAccount) return;
    setIsDisconnecting(true);
    const toastId = toast.loading('Disconnecting account...');
    
    try {
      const response = await apiServerClient.fetch('/linkedin/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selectedAccount.id })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      toast.success('Account disconnected successfully', { id: toastId });
      setDisconnectModalOpen(false);
      fetchCampaignsAndAccounts();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to disconnect account', { id: toastId });
    } finally {
      setIsDisconnecting(false);
      setSelectedAccount(null);
    }
  };

  const openPostDetails = (post) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const confirmAction = (post, type) => {
    setActionPost(post);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const executeAction = async () => {
    if (!actionPost || !actionType) return;
    setIsActionLoading(true);
    try {
      let newStatus = '';
      if (actionType === 'publish') newStatus = 'Published';
      if (actionType === 'fail') newStatus = 'Failed';
      if (actionType === 'archive') newStatus = 'Archived';

      const payload = { status: newStatus };
      if (newStatus === 'Published') {
        payload.publishedAt = new Date().toISOString();
        payload.publishedDate = new Date().toISOString();
      }

      await pb.collection('social_posts').update(actionPost.id, payload, { $autoCancel: false });
      toast.success(`Post marked as ${newStatus}`);
      fetchPosts();
      fetchMetrics();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update post status`);
    } finally {
      setIsActionLoading(false);
      setIsConfirmOpen(false);
      setActionPost(null);
      setActionType(null);
    }
  };

  const openPublishModal = (post) => {
    setActionPost(post);
    setPublishPlatforms([]);
    setPublishAccounts({});
    setPublishModalOpen(true);
  };

  const handleManualPublish = async () => {
    if (publishPlatforms.length === 0) return;
    
    const accountIds = publishPlatforms.map(p => publishAccounts[p]).filter(Boolean);
    if (accountIds.length !== publishPlatforms.length) {
      return toast.error('Please select an account for all chosen platforms');
    }

    setIsPublishing(true);
    const toastId = toast.loading('Publishing post...');

    try {
      const res = await apiServerClient.fetch('/social/manual-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialPostId: actionPost.id,
          platforms: publishPlatforms,
          accountIds: accountIds,
          publishMode: 'manual'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Publishing failed');
      }

      const successCount = data.results.filter(r => r.success).length;
      const failCount = data.results.filter(r => !r.success).length;

      if (failCount === 0) {
        toast.success(`Post published successfully to ${successCount} platform(s)`, { id: toastId });
      } else if (successCount > 0) {
        toast.warning(`Published to ${successCount} platform(s), failed on ${failCount}`, { id: toastId });
      } else {
        toast.error(`Failed to publish to all selected platforms`, { id: toastId });
      }

      setPublishModalOpen(false);
      fetchPosts();
      fetchMetrics();
      fetchActivities();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred during publishing', { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  const openActivityLog = (postId) => {
    setActivityPostId(postId);
    setActivityModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Publishing Monitor</h1>
        <p className="text-muted-foreground mt-2">
          Track and monitor the status of your social media publishing queue.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Drafts</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.draft}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.scheduled}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CalendarClock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.published}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.failed}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Platform Health
          </CardTitle>
          <CardDescription>Status of your connected social media accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.filter(a => a.platform === 'linkedin').map(account => (
              <div key={account.id} className="p-4 border border-border rounded-xl flex flex-col gap-3 bg-card shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                    <span className="font-medium capitalize">{account.platform}</span>
                  </div>
                  {getHealthBadge(account.isConnected, account.tokenStatus)}
                </div>
                <div>
                  <p className="text-sm font-medium">{account.accountName}</p>
                  <p className="text-xs text-muted-foreground">Last used: {account.lastUsed ? format(new Date(account.lastUsed), 'MMM d, yyyy') : 'Never'}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleTestConnection(account.id)} disabled={isTesting}>
                    <RefreshCw className={`w-3 h-3 mr-2 ${isTesting ? 'animate-spin' : ''}`} /> Test
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                    setSelectedAccount(account);
                    setDisconnectModalOpen(true);
                  }}>
                    <Trash2 className="w-3 h-3 mr-2" /> Disconnect
                  </Button>
                </div>
              </div>
            ))}
            {accounts.filter(a => a.platform === 'linkedin').length === 0 && (
              <div className="p-6 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground text-sm bg-muted/30">
                <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                <p>No LinkedIn account connected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Platform</label>
                <Select value={filters.platform} onValueChange={(v) => handleFilterChange('platform', v)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {PLATFORMS.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Campaign</label>
                <Select value={filters.campaignId} onValueChange={(v) => handleFilterChange('campaignId', v)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Date Range</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    value={filters.dateFrom} 
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="bg-background text-foreground"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input 
                    type="date" 
                    value={filters.dateTo} 
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
            
            <Button variant="outline" onClick={resetFilters} className="shrink-0">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Publishing Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Post Title</TableHead>
                  <TableHead>Campaign / Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        <p>No posts found matching your filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id} className="group">
                      <TableCell className="font-medium max-w-[250px] truncate">
                        {post.title || 'Untitled Post'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {post.expand?.campaignId && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">Campaign</Badge>
                              {post.expand.campaignId.name}
                            </span>
                          )}
                          {post.expand?.relatedProject && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">Project</Badge>
                              {post.expand.relatedProject.title}
                            </span>
                          )}
                          {!post.expand?.campaignId && !post.expand?.relatedProject && (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(post.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {post.scheduledAt ? format(new Date(post.scheduledAt), 'MMM d, yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status !== 'Published' && (
                            <Button variant="default" size="sm" onClick={() => openPublishModal(post)} className="h-8">
                              <Send className="w-3 h-3 mr-1"/> Publish
                            </Button>
                          )}
                          <Select onValueChange={(val) => {
                            if (val === 'view') openPostDetails(post);
                            if (val === 'activity') openActivityLog(post.id);
                            if (val === 'mark_published') confirmAction(post, 'publish');
                            if (val === 'mark_failed') confirmAction(post, 'fail');
                            if (val === 'archive') confirmAction(post, 'archive');
                          }}>
                            <SelectTrigger className="w-[110px] h-8 text-xs">
                              <SelectValue placeholder="Actions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view"><span className="flex items-center"><Eye className="w-3 h-3 mr-2"/> View Post</span></SelectItem>
                              <SelectItem value="activity"><span className="flex items-center"><Activity className="w-3 h-3 mr-2"/> View Activity</span></SelectItem>
                              {post.status !== 'Published' && <SelectItem value="mark_published"><span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2"/> Mark Published</span></SelectItem>}
                              {post.status !== 'Failed' && <SelectItem value="mark_failed"><span className="flex items-center"><XCircle className="w-3 h-3 mr-2"/> Mark Failed</span></SelectItem>}
                              {post.status !== 'Archived' && <SelectItem value="archive"><span className="flex items-center"><Archive className="w-3 h-3 mr-2"/> Archive</span></SelectItem>}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity Log
          </CardTitle>
          <CardDescription>System logs for publishing attempts, failures, and retries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activitiesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    </TableRow>
                  ))
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No recent activity found.
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(activity.timestamp || activity.created), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="capitalize font-medium">
                        {activity.action}
                      </TableCell>
                      <TableCell className="capitalize">
                        {activity.platform}
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className="capitalize">
                          {activity.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate">
                        {activity.errorMessage ? (
                          <span className="text-destructive">{activity.errorMessage}</span>
                        ) : activity.externalPostId ? (
                          <span className="text-muted-foreground">ID: {activity.externalPostId}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Post Details Modal */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>
              Detailed view of the selected social post.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Title</p>
                  <p className="font-medium">{selectedPost.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedPost.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Scheduled For</p>
                  <p className="text-sm">
                    {selectedPost.scheduledAt ? format(new Date(selectedPost.scheduledAt), 'PPpp') : 'Not scheduled'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Content Type</p>
                  <p className="text-sm">{selectedPost.contentType || 'Text'}</p>
                </div>
              </div>

              {selectedPost.failureReason && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Failure Reason
                  </p>
                  <p className="text-sm text-destructive/90">{selectedPost.failureReason}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Master Content</p>
                <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {selectedPost.masterContent || 'No content provided.'}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this post as {actionType === 'publish' ? 'Published' : actionType === 'fail' ? 'Failed' : 'Archived'}?
              {actionType === 'publish' && " This will NOT actually publish the post to social networks, it only updates the status in the system."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} disabled={isActionLoading}>
              {isActionLoading ? 'Updating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {selectedAccount?.accountName}? This will prevent future automated publishing to this account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDisconnectModalOpen(false)} disabled={isDisconnecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={isDisconnecting}>
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PublishConfirmationModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handleManualPublish}
        post={actionPost}
        platforms={PLATFORMS}
        accounts={accounts}
        selectedPlatforms={publishPlatforms}
        selectedAccounts={publishAccounts}
        onPlatformChange={setPublishPlatforms}
        onAccountChange={setPublishAccounts}
        isPublishing={isPublishing}
      />

      <ActivityLogModal 
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        postId={activityPostId}
      />
    </div>
  );
}