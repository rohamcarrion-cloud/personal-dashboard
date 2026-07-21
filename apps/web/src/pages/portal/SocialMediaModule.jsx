import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, CheckCircle2, Share2, Target, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ManualPublishingTools from '@/components/ManualPublishingTools.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';

const SocialMediaModule = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState([]);
  
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let filter = '';
      if (statusFilter !== 'all') {
        filter = `status = "${statusFilter}"`;
      }
      const records = await pb.collection('social_posts').getFullList({
        filter,
        sort: '-created',
        expand: 'campaignId.relatedProject,relatedProject',
        $autoCancel: false,
      });
      setPosts(records);
      setSelectedPosts([]);
    } catch (error) {
      toast.error('Failed to load social posts');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (actionStatus) => {
    if (selectedPosts.length === 0) return;
    try {
      await Promise.all(selectedPosts.map(id => 
        pb.collection('social_posts').update(id, { status: actionStatus }, { $autoCancel: false })
      ));
      toast.success(`Marked ${selectedPosts.length} posts as ${actionStatus}`);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to update posts.');
    }
  };

  const openDetails = (post) => {
    setActivePost(post);
    setEditData({
      status: post.status || 'Draft',
      scheduledDate: post.scheduledDate ? post.scheduledDate.substring(0, 16) : '',
      externalPlatformLink: post.externalPlatformLink || '',
      publishingNotes: post.publishingNotes || '',
      linkedinCaption: post.linkedinCaption || '',
      facebookCaption: post.facebookCaption || '',
      instagramCaption: post.instagramCaption || '',
      xCaption: post.xCaption || '',
      tiktokCaption: post.tiktokCaption || '',
      youtubeCaption: post.youtubeCaption || '',
    });
    setDetailsOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const saveDetails = async () => {
    if (editData.status === 'Scheduled' && !editData.scheduledDate) return toast.error('Scheduled Date required');
    if (editData.status === 'Published' && !editData.externalPlatformLink) return toast.error('Published URL required');

    try {
      const dataToSave = { ...editData };
      if (dataToSave.scheduledDate) {
        dataToSave.scheduledDate = new Date(dataToSave.scheduledDate).toISOString();
      } else {
        dataToSave.scheduledDate = null;
      }
      if (dataToSave.status === 'Published' && activePost.status !== 'Published') {
        dataToSave.publishedDate = new Date().toISOString();
        dataToSave.publishedAt = new Date().toISOString();
      }
      await pb.collection('social_posts').update(activePost.id, dataToSave, { $autoCancel: false });
      toast.success('Post details saved successfully');
      fetchPosts();
      setDetailsOpen(false);
    } catch (error) {
      toast.error('Failed to save details.');
    }
  };

  const toggleSelect = (id) => setSelectedPosts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);

  const statuses = ['all', 'Draft', 'Scheduled', 'Published', 'Failed', 'Archived'];

  if (loading) return <div className="space-y-4 max-w-7xl mx-auto"><Skeleton className="h-96 w-full rounded-xl" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Social Media" 
        description="Manage and draft social content. Use the Publishing Queue for batch operations."
        primaryActionLabel="New Post"
        onPrimaryAction={() => window.location.href = '/portal/command-center/content-engine'}
        secondaryActions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-background rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status === 'all' ? 'All Posts' : status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {selectedPosts.length > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-muted/50 p-2 rounded-lg border border-border w-fit">
          <span className="text-sm text-muted-foreground mr-2 whitespace-nowrap pl-2">
            {selectedPosts.length} selected
          </span>
          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('Draft')}>Mark Draft</Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('Archived')}>Archive</Button>
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState 
          icon={Share2}
          title="No posts found"
          description="Try changing your filters or create a new post in the Content Engine."
          actionLabel="Go to Content Engine"
          onAction={() => window.location.href = '/portal/command-center/content-engine'}
        />
      ) : (
        <div className="grid gap-4">
          {posts.map(post => {
            const relatedProject = post.expand?.campaignId?.expand?.relatedProject || post.expand?.relatedProject;
            return (
              <div key={post.id} className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4 transition-colors hover:bg-muted/50">
                <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                  <Checkbox checked={selectedPosts.includes(post.id)} onCheckedChange={() => toggleSelect(post.id)} className="mt-1 md:mt-0" />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openDetails(post)}>
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <h4 className="font-semibold text-lg truncate text-foreground">{post.title}</h4>
                      <StatusBadge status={post.status} />
                      <Badge variant="outline" className="bg-background">{post.contentType}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      {post.expand?.campaignId && (
                        <span className="flex items-center gap-1 text-primary font-medium"><Target className="w-3.5 h-3.5" /> {post.expand.campaignId.name}</span>
                      )}
                      {relatedProject && (
                        <span className="flex items-center gap-1 text-muted-foreground"><FolderKanban className="w-3.5 h-3.5" /> {relatedProject.title}</span>
                      )}
                      {post.scheduledDate && (
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Scheduled: {format(new Date(post.scheduledDate), 'MMM d, yyyy HH:mm')}</span>
                      )}
                      {post.publishedDate && (
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> Published: {format(new Date(post.publishedDate), 'MMM d')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => openDetails(post)} className="shrink-0 md:w-auto w-full mt-2 md:mt-0">Edit & Publish</Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {activePost && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{activePost.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={activePost.status} />
                      {activePost.expand?.campaignId && (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                          {activePost.expand.campaignId.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={saveDetails} className="bg-primary text-primary-foreground">Save Changes</Button>
                </div>
              </DialogHeader>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-8 bg-background">
                <div className="lg:col-span-3 space-y-6">
                  <Tabs defaultValue="linkedin" className="w-full">
                    <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-4 border-b border-border w-full justify-start rounded-none">
                      {['linkedin', 'x', 'facebook', 'instagram', 'tiktok', 'youtube'].map(plat => (
                        <TabsTrigger key={plat} value={plat} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 text-sm data-[state=active]:text-primary">
                          {plat === 'x' ? 'X/Twitter' : plat.charAt(0).toUpperCase() + plat.slice(1)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {['linkedin', 'facebook', 'instagram', 'tiktok', 'youtube'].map(plat => (
                      <TabsContent key={plat} value={plat} className="space-y-4 outline-none">
                        <Textarea value={editData[`${plat}Caption`]} onChange={e => handleEditChange(`${plat}Caption`, e.target.value)} className="min-h-[250px] bg-background" placeholder={`Draft your ${plat} caption here...`} />
                        <ManualPublishingTools post={activePost} platform={plat} onUpdate={(updated) => { setActivePost(updated); fetchPosts(); }}/>
                      </TabsContent>
                    ))}
                    <TabsContent value="x" className="space-y-4 outline-none">
                      <div className="relative">
                        <Textarea value={editData.xCaption} onChange={e => handleEditChange('xCaption', e.target.value)} className="min-h-[150px] bg-background pb-8" placeholder="Draft your tweet here..." />
                        <span className={`absolute bottom-2 right-3 text-xs font-medium ${editData.xCaption.length > 280 ? 'text-destructive' : 'text-muted-foreground'}`}>{editData.xCaption.length} / 280</span>
                      </div>
                      <ManualPublishingTools post={activePost} platform="x" onUpdate={(updated) => { setActivePost(updated); fetchPosts(); }}/>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="lg:col-span-2 space-y-6 bg-muted/20 p-6 rounded-2xl border border-border h-fit">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><Calendar className="w-5 h-5"/> Status & Schedule</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Select value={editData.status} onValueChange={v => handleEditChange('status', v)}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                          <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editData.status === 'Scheduled' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-medium text-muted-foreground">Schedule Date & Time <span className="text-destructive">*</span></label>
                        <Input type="datetime-local" value={editData.scheduledDate} onChange={e => handleEditChange('scheduledDate', e.target.value)} className="bg-background" />
                      </div>
                    )}
                    {editData.status === 'Published' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-medium text-muted-foreground">Published URL <span className="text-destructive">*</span></label>
                        <Input type="url" placeholder="https://..." value={editData.externalPlatformLink} onChange={e => handleEditChange('externalPlatformLink', e.target.value)} className="bg-background" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Publishing Notes</label>
                      <Textarea placeholder="Add tags, mentions, or instructions..." value={editData.publishingNotes} onChange={e => handleEditChange('publishingNotes', e.target.value)} className="bg-background min-h-[100px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialMediaModule;