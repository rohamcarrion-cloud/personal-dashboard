import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ManualPublishingTools from '@/components/ManualPublishingTools.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import AccountSelector from '@/components/SocialIntegration/AccountSelector.jsx';
import SchedulingSuggestions from '@/components/PublishingQueue/SchedulingSuggestions.jsx';
import PublishConfirmationModal from '@/components/PublishConfirmationModal.jsx';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ChevronDown, CheckCircle2, Clock, LayoutGrid, FolderKanban, Target, CalendarDays, Share2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PLATFORMS = ['linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube'];

const PublishingQueueModule = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState([]);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [postsToSchedule, setPostsToSchedule] = useState([]);

  // Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [postToPublish, setPostToPublish] = useState(null);
  const [publishPlatforms, setPublishPlatforms] = useState([]);
  const [publishAccounts, setPublishAccounts] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, campsRes, projRes, accsRes] = await Promise.all([
        pb.collection('social_posts').getFullList({ sort: '-created', expand: 'campaignId.relatedProject,relatedProject', $autoCancel: false }),
        pb.collection('campaigns').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('projects').getFullList({ sort: '-created', $autoCancel: false }),
        currentUser ? pb.collection('social_accounts').getFullList({ filter: `userId="${currentUser.id}" && (tokenStatus="valid" || tokenStatus="connected")`, $autoCancel: false }) : Promise.resolve([])
      ]);
      setPosts(postsRes); setCampaigns(campsRes); setProjects(projRes); setAccounts(accsRes);
    } catch (error) {
      toast.error('Failed to load publishing queue');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (actionStatus) => {
    if (selectedPosts.length === 0) return;
    try {
      const payload = { status: actionStatus };
      if (actionStatus === 'Published') {
        payload.publishedAt = new Date().toISOString();
        payload.publishedDate = new Date().toISOString();
      }
      await Promise.all(selectedPosts.map(id => pb.collection('social_posts').update(id, payload, { $autoCancel: false })));
      toast.success(`Marked ${selectedPosts.length} posts as ${actionStatus}`);
      fetchData(); setSelectedPosts([]);
    } catch (error) {
      toast.error(`Failed to update posts to ${actionStatus}.`);
    }
  };

  const openScheduleDialog = (ids) => { 
    setPostsToSchedule(ids); 
    setScheduleDate(''); 
    setSelectedPlatform('all');
    setSelectedAccounts([]);
    setScheduleDialogOpen(true); 
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleDate) return toast.error('Please select a date and time');
    if (!selectedPlatform || selectedPlatform === 'all') return toast.error('Please select a platform');
    if (selectedAccounts.length === 0) return toast.error('Please select at least one account');
    
    try {
      const isoDate = new Date(scheduleDate).toISOString();
      
      await Promise.all(postsToSchedule.map(id => 
        pb.collection('social_posts').update(id, { 
          status: 'Scheduled', 
          scheduledDate: isoDate,
          accountIds: selectedAccounts.join(',')
        }, { $autoCancel: false })
      ));
      
      toast.success(`Successfully scheduled ${postsToSchedule.length} posts`);
      setScheduleDialogOpen(false); 
      fetchData(); 
      setSelectedPosts([]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule posts');
    }
  };

  const openPublishModal = (post) => {
    setPostToPublish(post);
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
          socialPostId: postToPublish.id,
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
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred during publishing', { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedPosts.length} posts?`)) return;
    try {
      await Promise.all(selectedPosts.map(id => pb.collection('social_posts').delete(id, { $autoCancel: false })));
      toast.success(`Deleted ${selectedPosts.length} posts`);
      fetchData(); setSelectedPosts([]);
    } catch (error) {
      toast.error('Failed to delete posts');
    }
  };

  const toggleSelect = (id) => setSelectedPosts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedPosts(selectedPosts.length === filteredPosts.length && filteredPosts.length > 0 ? [] : filteredPosts.map(p => p.id));

  const filteredPosts = posts.filter(post => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    if (platformFilter !== 'all' && (!post.title.toLowerCase().includes(platformFilter.toLowerCase()))) return false;
    if (campaignFilter !== 'all' && post.campaignId !== campaignFilter) return false;
    if (projectFilter !== 'all' && (post.expand?.campaignId?.relatedProject || post.relatedProject) !== projectFilter) return false;
    if (dateFilter && (!post.scheduledDate || !post.scheduledDate.startsWith(dateFilter))) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const total = posts.length;
  const draftCount = posts.filter(p => p.status === 'Draft').length;
  const schedCount = posts.filter(p => p.status === 'Scheduled').length;
  const pubCount = posts.filter(p => p.status === 'Published').length;

  if (loading) return <div className="module-container"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;

  return (
    <div className="module-container">
      <ModuleHeader 
        title="Publishing Queue" 
        description="Schedule and manage content publishing across all platforms."
        searchTerm={searchQuery}
        onSearch={setSearchQuery}
        searchPlaceholder="Search posts..."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
          <p className="text-3xl font-bold mt-2">{total}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> Drafts</p>
          <p className="text-3xl font-bold mt-2">{draftCount}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-blue-600 flex items-center gap-2"><Clock className="w-4 h-4"/> Scheduled</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">{schedCount}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Published</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{pubCount}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {PLATFORMS.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Campaign" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative w-[140px]">
            <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="text-sm" title="Filter by Scheduled Date" />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg border border-border">
              <span className="text-sm font-medium whitespace-nowrap mr-2">{selectedPosts.length} selected</span>
              <Button variant="secondary" size="sm" onClick={() => handleBulkAction('Draft')}>Draft</Button>
              <Button variant="secondary" size="sm" onClick={() => openScheduleDialog(selectedPosts)}>Smart Schedule</Button>
              <Button variant="secondary" size="sm" onClick={() => handleBulkAction('Published')}>Mark Published</Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete</Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground">
              <tr>
                <th className="px-4 py-3 w-12 text-center"><Checkbox checked={selectedPosts.length > 0 && selectedPosts.length === filteredPosts.length} onCheckedChange={toggleSelectAll} /></th>
                <th className="px-4 py-3 font-medium">Post Title</th>
                <th className="px-4 py-3 font-medium">Campaign / Project</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Scheduled Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No posts found matching your criteria.</td></tr>
              ) : (
                filteredPosts.map(post => {
                  const relatedProject = post.expand?.campaignId?.expand?.relatedProject || post.expand?.relatedProject;
                  return (
                    <React.Fragment key={post.id}>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-center"><Checkbox checked={selectedPosts.includes(post.id)} onCheckedChange={() => toggleSelect(post.id)} /></td>
                        <td className="px-4 py-3 font-medium text-foreground max-w-[250px] truncate">{post.title}{post.contentType && <span className="ml-2 text-xs font-normal text-muted-foreground">({post.contentType})</span>}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                          {post.expand?.campaignId && <div className="flex items-center text-xs text-primary mb-0.5"><Target className="w-3 h-3 mr-1" /> {post.expand.campaignId.name}</div>}
                          {relatedProject && <div className="flex items-center text-xs"><FolderKanban className="w-3 h-3 mr-1" /> {relatedProject.title}</div>}
                          {!post.expand?.campaignId && !relatedProject && '-'}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{post.scheduledDate ? format(new Date(post.scheduledDate), 'MMM d, yyyy HH:mm') : '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {post.status !== 'Published' && (
                              <>
                                <Button variant="default" size="sm" onClick={() => openPublishModal(post)} className="h-8">
                                  <Send className="w-3 h-3 mr-1"/> Publish Now
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openScheduleDialog([post.id])} className="h-8">
                                  <CalendarDays className="w-3 h-3 mr-1"/> Schedule
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className="h-8">
                              {expandedPostId === post.id ? 'Close' : 'Details'} <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${expandedPostId === post.id ? 'rotate-180' : ''}`} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedPostId === post.id && (
                        <tr className="bg-muted/10">
                          <td colSpan={6} className="px-4 py-6 border-t border-border">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-12 pr-4">
                              {PLATFORMS.map(plat => {
                                const platKey = plat.toLowerCase();
                                const hasCaption = post[`${platKey === 'twitter' ? 'x' : platKey}Caption`];
                                if (!hasCaption) return null;
                                return <ManualPublishingTools key={platKey} post={post} platform={platKey === 'twitter' ? 'x' : platKey} onUpdate={fetchData} />;
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Share2 className="w-5 h-5"/> Smart Scheduling</DialogTitle></DialogHeader>
          <div className="py-4 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" disabled className="hidden">Select Platform</SelectItem>
                  {PLATFORMS.map(p => <SelectItem key={p} value={p.toLowerCase()} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPlatform && selectedPlatform !== 'all' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium">Select Accounts</label>
                <AccountSelector 
                  platform={selectedPlatform} 
                  selectedAccounts={selectedAccounts} 
                  onChange={setSelectedAccounts} 
                />
              </div>
            )}

            {selectedPlatform && selectedPlatform !== 'all' && (
              <SchedulingSuggestions 
                platform={selectedPlatform} 
                campaignId={posts.find(p => p.id === postsToSchedule[0])?.campaignId}
                onApply={(val) => {
                  if (val.includes(':') && !val.includes('-')) {
                    const today = new Date().toISOString().split('T')[0];
                    setScheduleDate(`${today}T${val}`);
                  } else {
                    setScheduleDate(val);
                  }
                  toast.success('Applied smart suggestion');
                }} 
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Date & Time</label>
              <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleSubmit}>Schedule Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PublishConfirmationModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handleManualPublish}
        post={postToPublish}
        platforms={PLATFORMS}
        accounts={accounts}
        selectedPlatforms={publishPlatforms}
        selectedAccounts={publishAccounts}
        onPlatformChange={setPublishPlatforms}
        onAccountChange={setPublishAccounts}
        isPublishing={isPublishing}
      />
    </div>
  );
};

export default PublishingQueueModule;