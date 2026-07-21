import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Pencil, Trash2, LayoutDashboard, Image as ImageIcon, CheckCircle2, Share2, FileText, Mail, Newspaper, Video, Sparkles, Save, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import ContentSuggestionsPanel from '@/components/ContentSuggestionsPanel.jsx';

// ... (MediaPicker component remains same, omitted for brevity in this block, assuming it's inline)
const MediaPicker = ({ selectedIds, onSelect, onClose }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pb.collection('media_library').getFullList({ sort: '-created', $autoCancel: false })
      .then(res => setMedia(res))
      .catch(err => toast.error('Failed to load media'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading assets...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-1">
        {media.map(item => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div 
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
            >
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {item.fileUrl ? (
                   <img src={pb.files.getUrl(item, item.fileUrl)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground opacity-30" />
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary bg-background rounded-full" />
                  </div>
                )}
              </div>
              <div className="p-2 text-xs font-medium truncate bg-card">{item.title}</div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={onClose}>Done Selecting ({selectedIds.length})</Button>
      </div>
    </div>
  );
};

const ContentEngineModule = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [generatedVersions, setGeneratedVersions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savingStates, setSavingStates] = useState({});
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '', contentTheme: '', coreMessage: '', targetAudience: '', callToAction: '',
    contentPillar: '', status: 'Draft', relatedProject: 'none', campaignId: 'none', linkedAssets: []
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contRes, projRes, campRes] = await Promise.all([
        pb.collection('master_content').getFullList({ sort: '-created', expand: 'relatedProject,campaignId,linkedAssets', $autoCancel: false }),
        pb.collection('projects').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('campaigns').getFullList({ sort: '-created', $autoCancel: false })
      ]);
      setContent(contRes); setProjects(projRes); setCampaigns(campRes);
      if (selectedMaster) {
        const updated = contRes.find(c => c.id === selectedMaster.id);
        if (updated) setSelectedMaster(updated);
      }
    } catch (error) {
      toast.error('Failed to load content engine data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (item = null) => {
    setEditItem(item);
    if (item) {
      setFormData({
        title: item.title || '', contentTheme: item.contentTheme || '', coreMessage: item.coreMessage || '',
        targetAudience: item.targetAudience || '', callToAction: item.callToAction || '', contentPillar: item.contentPillar || '',
        status: item.status || 'Draft', relatedProject: item.relatedProject || 'none', campaignId: item.campaignId || 'none', linkedAssets: item.linkedAssets || []
      });
    } else {
      setFormData({
        title: '', contentTheme: '', coreMessage: '', targetAudience: '', callToAction: '',
        contentPillar: 'Thought Leadership', status: 'Draft', relatedProject: 'none', campaignId: 'none', linkedAssets: []
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.coreMessage) return toast.error('Title and Core Message are required');
    setIsSubmitting(true);
    try {
      const dataToSave = { ...formData };
      if (dataToSave.relatedProject === 'none') dataToSave.relatedProject = '';
      if (dataToSave.campaignId === 'none') dataToSave.campaignId = '';

      if (editItem) {
        await pb.collection('master_content').update(editItem.id, dataToSave, { $autoCancel: false });
        toast.success('Content updated');
      } else {
        await pb.collection('master_content').create(dataToSave, { $autoCancel: false });
        toast.success('Master content created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this master content?')) return;
    try {
      await pb.collection('master_content').delete(id, { $autoCancel: false });
      toast.success('Content deleted');
      if (selectedMaster?.id === id) { setSelectedMaster(null); setGeneratedVersions(null); }
      fetchData();
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const toggleAssetSelection = (id) => {
    setFormData(prev => ({
      ...prev, linkedAssets: prev.linkedAssets.includes(id) ? prev.linkedAssets.filter(i => i !== id) : [...prev.linkedAssets, id]
    }));
  };

  const handleGenerateVersions = () => {
    if (!selectedMaster) return;
    setIsGenerating(true);
    setTimeout(() => {
      const { title, coreMessage, contentTheme, targetAudience, callToAction } = selectedMaster;
      const themeTag = contentTheme ? `#${contentTheme.replace(/\s+/g, '')}` : '#Update';
      const versions = {
        twitter: `🚀 ${title}\n\n${coreMessage.substring(0, 120)}...\n\n👉 ${callToAction}\n\n${themeTag}`,
        linkedin: `💡 ${title}\n\n${coreMessage}\n\nPerfect for ${targetAudience || 'professionals'} looking to stay ahead.\n\n${callToAction}\n\n${themeTag} #Leadership`,
        facebook: `Hey everyone! 👋 ${title}\n\n${coreMessage}\n\nWe'd love to hear your thoughts below! 👇\n\n${callToAction}`,
        instagram: `📸 ${title}\n\n${coreMessage}\n\nLink in bio! 🔗\n\n👇 ${callToAction}\n\n${themeTag} #InstaGood`,
        blog: `# ${title}\n\n## Introduction\n${coreMessage}\n\n## Deep Dive\nThis topic is especially relevant for ${targetAudience || 'our readers'} because it touches on core aspects of ${contentTheme || 'our industry'}.\n\n## Conclusion\n${callToAction}`,
        newsletter: `Subject: ${title}\n\nHi there,\n\nWe have some exciting updates to share regarding ${contentTheme || 'recent developments'}.\n\n${coreMessage}\n\nBest,\nThe Team\n\n${callToAction}`,
        video: `[SCENE START]\nTitle: ${title}\n\nHOOK (0:00-0:05): ${coreMessage.substring(0, 60)}...\n\nBODY (0:05-0:45): ${coreMessage}\n\nOUTRO (0:45-1:00): ${callToAction}\n[SCENE END]`,
        press: `FOR IMMEDIATE RELEASE\n\n${title}\n\n${coreMessage}\n\nAbout us: We are dedicated to serving ${targetAudience || 'our community'} with excellence in ${contentTheme || 'our field'}.\n\nContact for more info.`
      };
      setGeneratedVersions(versions);
      setIsGenerating(false);
      toast.success('Content versions generated successfully!');
    }, 1500);
  };

  const handleVersionChange = (platform, value) => setGeneratedVersions(prev => ({ ...prev, [platform]: value }));

  const saveVersion = async (platform) => {
    if (!selectedMaster || !generatedVersions || !generatedVersions[platform]) return;
    setSavingStates(prev => ({ ...prev, [platform]: true }));
    try {
      const baseData = { masterContentId: selectedMaster.id, campaignId: selectedMaster.campaignId || '', relatedProject: selectedMaster.relatedProject || '' };
      const content = generatedVersions[platform];
      const titlePrefix = `${selectedMaster.title} - ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;

      if (['twitter', 'linkedin', 'facebook', 'instagram'].includes(platform)) {
        const captionField = platform === 'twitter' ? 'xCaption' : `${platform}Caption`;
        await pb.collection('social_posts').create({ ...baseData, title: titlePrefix, contentType: 'Text', status: 'Draft', [captionField]: content, platforms: platform === 'twitter' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1) }, { $autoCancel: false });
      } else if (platform === 'video') {
        await pb.collection('social_posts').create({ ...baseData, title: titlePrefix, contentType: 'Video', status: 'Draft', youtubeCaption: content, platforms: 'YouTube', notes: content }, { $autoCancel: false });
      } else if (platform === 'blog') {
        await pb.collection('blog_posts').create({ ...baseData, title: selectedMaster.title, slug: selectedMaster.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), content: content, status: 'Draft' }, { $autoCancel: false });
      } else if (platform === 'newsletter') {
        await pb.collection('newsletter_campaigns').create({ ...baseData, title: titlePrefix, subject: selectedMaster.title, content: content, status: 'Draft' }, { $autoCancel: false });
      } else if (platform === 'press') {
        await pb.collection('press_media').create({ ...baseData, title: titlePrefix, notes: content, pitchStatus: 'Drafted' }, { $autoCancel: false });
      }

      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} draft saved!`);
      const newVersions = { ...generatedVersions };
      delete newVersions[platform];
      setGeneratedVersions(Object.keys(newVersions).length > 0 ? newVersions : null);
    } catch (error) {
      toast.error(`Failed to save ${platform} draft`);
    } finally {
      setSavingStates(prev => ({ ...prev, [platform]: false }));
    }
  };

  const saveAllVersions = async () => {
    if (!generatedVersions) return;
    for (const platform of Object.keys(generatedVersions)) await saveVersion(platform);
    toast.success('All drafts saved successfully!');
  };

  const calculateReadTime = (text) => `${Math.ceil(text.trim().split(/\s+/).length / 200)} min read`;

  if (loading) return <div className="module-container"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;

  return (
    <div className="module-container">
      <ModuleHeader 
        title="Content Engine" 
        description="Create core master content and auto-generate platform-specific versions."
        primaryActionLabel="New Master Content"
        onPrimaryAction={() => handleOpenForm()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <ContentSuggestionsPanel />
          
          <h2 className="font-semibold text-lg px-1">Master Content</h2>
          {content.length === 0 ? (
            <EmptyState 
              icon={LayoutDashboard}
              title="No master content yet"
              description="Create your first master content to start generating platform versions."
              actionLabel="Create Content"
              onAction={() => handleOpenForm()}
            />
          ) : (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 pb-4">
              {content.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => { setSelectedMaster(item); setGeneratedVersions(null); }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${selectedMaster?.id === item.id ? 'bg-primary/5 border-primary shadow-md scale-[1.02]' : 'bg-card border-border hover:border-primary/40 hover:shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">{item.contentPillar}</Badge>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-background" onClick={(e) => { e.stopPropagation(); handleOpenForm(item); }}><Pencil className="w-3.5 h-3.5"/></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 className="w-3.5 h-3.5"/></Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 leading-snug">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.coreMessage}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Repurposing Workspace
                </h2>
                {selectedMaster && !generatedVersions && (
                  <Button onClick={handleGenerateVersions} disabled={isGenerating} className="rounded-xl shadow-sm">
                    {isGenerating ? 'Generating...' : 'Generate Versions'} <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {generatedVersions && (
                  <Button onClick={saveAllVersions} variant="secondary" className="rounded-xl shadow-sm">
                    Save All Drafts <Save className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              <div className="bg-background rounded-2xl border border-border p-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Selected Master Content</label>
                <Select value={selectedMaster?.id || ''} onValueChange={(val) => { setSelectedMaster(content.find(c => c.id === val)); setGeneratedVersions(null); }}>
                  <SelectTrigger className="w-full bg-muted/50 border-transparent hover:bg-muted transition-colors rounded-xl h-12">
                    <SelectValue placeholder="Select master content to repurpose..." />
                  </SelectTrigger>
                  <SelectContent>
                    {content.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>

                {selectedMaster && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm animate-in fade-in slide-in-from-top-2">
                    <div><span className="text-muted-foreground block mb-1">Theme:</span><span className="font-medium">{selectedMaster.contentTheme || '-'}</span></div>
                    <div><span className="text-muted-foreground block mb-1">Target Audience:</span><span className="font-medium">{selectedMaster.targetAudience || '-'}</span></div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground block mb-1">Core Message:</span><span className="font-medium leading-relaxed">{selectedMaster.coreMessage}</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 flex-1 bg-background overflow-y-auto">
              {!selectedMaster ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-12">
                  <Share2 className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select Master Content</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">Choose a master content item above to generate platform-specific versions automatically.</p>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">Generating Content...</h3>
                    <p className="text-sm text-muted-foreground">Adapting your core message for 8 different platforms.</p>
                  </div>
                </div>
              ) : generatedVersions ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                  {Object.entries(generatedVersions).map(([platform, text]) => {
                    const isTwitter = platform === 'twitter';
                    const isLongForm = ['blog', 'newsletter', 'press'].includes(platform);
                    const charCount = text.length;
                    const isOverLimit = isTwitter && charCount > 280;
                    const icons = { twitter: <Share2 className="w-4 h-4 text-blue-400" />, linkedin: <Share2 className="w-4 h-4 text-blue-600" />, facebook: <Share2 className="w-4 h-4 text-blue-500" />, instagram: <ImageIcon className="w-4 h-4 text-pink-500" />, blog: <FileText className="w-4 h-4 text-orange-500" />, newsletter: <Mail className="w-4 h-4 text-green-500" />, video: <Video className="w-4 h-4 text-red-500" />, press: <Newspaper className="w-4 h-4 text-purple-500" /> };

                    return (
                      <Card key={platform} className="border-border shadow-sm flex flex-col">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                          <CardTitle className="text-sm font-bold flex items-center gap-2 capitalize">{icons[platform]} {platform}</CardTitle>
                          {isTwitter ? <span className={`text-xs font-medium ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>{charCount} / 280</span> : isLongForm ? <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {calculateReadTime(text)}</span> : null}
                        </CardHeader>
                        <CardContent className="p-4 pt-2 flex-1">
                          <Textarea value={text} onChange={(e) => handleVersionChange(platform, e.target.value)} className={`min-h-[150px] resize-y text-sm leading-relaxed ${isOverLimit ? 'border-destructive focus-visible:ring-destructive' : ''}`} />
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button variant="secondary" size="sm" className="w-full rounded-lg" onClick={() => saveVersion(platform)} disabled={savingStates[platform]}>
                            {savingStates[platform] ? 'Saving...' : 'Save Draft'}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-80 py-16">
                  <Sparkles className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-6">Click the button above to automatically adapt this master content for all your channels.</p>
                  <Button onClick={handleGenerateVersions} className="rounded-xl shadow-sm">Generate Versions Now</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen && !mediaPickerOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Master Content' : 'New Master Content'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="form-label">Internal Title <span className="form-required">*</span></label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Q3 Product Launch Overview" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="form-label">Content Pillar</label>
                <Select value={formData.contentPillar} onValueChange={v => setFormData({...formData, contentPillar: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Thought Leadership', 'Product Update', 'Case Study', 'Industry News', 'Behind-the-Scenes', 'Other'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="form-label">Status</label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Draft', 'Active', 'Archived'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="form-label">Core Message / Thesis <span className="form-required">*</span></label>
              <Textarea value={formData.coreMessage} onChange={e => setFormData({...formData, coreMessage: e.target.value})} className="min-h-[120px]" placeholder="The main idea you want to communicate across all channels..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="form-label">Target Audience</label><Input value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} /></div>
              <div className="space-y-2"><label className="form-label">Call to Action</label><Input value={formData.callToAction} onChange={e => setFormData({...formData, callToAction: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="form-label">Related Project</label>
                <Select value={formData.relatedProject} onValueChange={v => setFormData({...formData, relatedProject: v})}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">None</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="form-label">Campaign</label>
                <Select value={formData.campaignId} onValueChange={v => setFormData({...formData, campaignId: v})}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">None</SelectItem>{campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div><h4 className="font-semibold text-sm">Linked Media Assets</h4><p className="text-xs text-muted-foreground mt-0.5">Attach images, videos, or documents to use when repurposing.</p></div>
                <Button type="button" variant="outline" size="sm" onClick={() => setMediaPickerOpen(true)}><ImageIcon className="w-4 h-4 mr-2"/> Select Assets</Button>
              </div>
              {formData.linkedAssets.length > 0 ? (
                <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="font-medium">{formData.linkedAssets.length} asset(s) selected for this content.</span></div>
              ) : (
                <div className="p-6 bg-muted/20 border border-border border-dashed rounded-xl text-center"><p className="text-sm text-muted-foreground">No assets linked yet.</p></div>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{editItem ? 'Save Changes' : 'Create Content'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={mediaPickerOpen} onOpenChange={setMediaPickerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Select Media Assets</DialogTitle></DialogHeader>
          <MediaPicker selectedIds={formData.linkedAssets} onSelect={toggleAssetSelection} onClose={() => setMediaPickerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentEngineModule;