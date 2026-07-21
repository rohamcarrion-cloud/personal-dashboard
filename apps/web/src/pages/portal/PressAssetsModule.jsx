import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Globe, ExternalLink, Image as ImageIcon, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';

const PressAssetsModule = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeTab, setActiveTab] = useState('Headshot');
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('press_assets').getFullList({ sort: '-created', $autoCancel: false });
      setAssets(records);
    } catch (error) { toast.error('Failed to load press assets'); } finally { setLoading(false); }
  };

  const getAssetsByType = (type) => assets.filter(a => a.assetType === type);

  const handleOpenForm = (type = activeTab, item = null) => {
    setEditItem(item);
    if (item) setFormData({ ...item });
    else setFormData({ title: '', assetType: type, content: '', assetUrl: '', downloadUrl: '', isApproved: false, isPublic: false, pressContactEmail: '', pressContactName: '', pressContactPhone: '' });
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Title is required');
    try {
      if (editItem) await pb.collection('press_assets').update(editItem.id, formData, { $autoCancel: false });
      else await pb.collection('press_assets').create(formData, { $autoCancel: false });
      toast.success('Saved successfully'); setDialogOpen(false); fetchAssets();
    } catch (error) { toast.error('Failed to save asset'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try { await pb.collection('press_assets').delete(id, { $autoCancel: false }); toast.success('Deleted'); fetchAssets(); } catch (error) { toast.error('Failed to delete asset'); }
  };

  const toggleApproval = async (id, currentStatus) => { try { await pb.collection('press_assets').update(id, { isApproved: !currentStatus }, { $autoCancel: false }); fetchAssets(); } catch (error) { toast.error('Failed to update status'); } };
  const toggleVisibility = async (id, currentStatus) => { try { await pb.collection('press_assets').update(id, { isPublic: !currentStatus }, { $autoCancel: false }); fetchAssets(); } catch (error) { toast.error('Failed to update visibility'); } };

  const renderVisualGrid = (type) => (
    getAssetsByType(type).length === 0 ? <EmptyState icon={ImageIcon} title={`No ${type}s`} description={`Add a ${type} for press use.`} actionLabel={`Add ${type}`} onAction={() => handleOpenForm(type)} /> :
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {getAssetsByType(type).map(asset => (
        <Card key={asset.id} className="overflow-hidden border-border group flex flex-col h-full rounded-lg shadow-sm">
          <div className="aspect-square bg-muted/30 p-4 flex items-center justify-center border-b border-border relative">
            {asset.assetUrl ? <img src={asset.assetUrl} alt={asset.title} className="max-w-full max-h-full object-contain" /> : <ImageIcon className="w-8 h-8 text-muted-foreground opacity-30" />}
            <div className="absolute top-2 right-2 flex gap-1">
              {asset.isApproved && <Badge className="bg-green-500/10 text-green-700 border-0 px-1.5 py-0 text-[10px]">Approved</Badge>}
              {asset.isPublic && <Badge variant="secondary" className="px-1.5 py-0 border-0 text-[10px]"><Globe className="w-3 h-3 mr-1"/> Public</Badge>}
            </div>
          </div>
          <CardContent className="p-3 flex-1 flex flex-col">
            <h3 className="font-semibold text-sm mb-3 flex-1">{asset.title}</h3>
            <div className="flex gap-2 mt-auto">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => handleOpenForm(type, asset)}><Pencil className="w-3 h-3 mr-1"/> Edit</Button>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0 text-destructive" onClick={() => handleDelete(asset.id)}><Trash2 className="w-3 h-3"/></Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <button onClick={() => handleOpenForm(type)} className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"><Plus className="w-6 h-6 mb-2" /><span className="font-medium text-sm">Add {type}</span></button>
    </div>
  );

  const renderTextList = (type) => (
    getAssetsByType(type).length === 0 ? <EmptyState icon={Newspaper} title={`No ${type}s`} description={`Add a ${type}.`} actionLabel={`Add ${type}`} onAction={() => handleOpenForm(type)} /> :
    <div className="space-y-4">
      {getAssetsByType(type).map(asset => (
        <Card key={asset.id} className="border-border rounded-lg shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-3 pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">{asset.title} {type === 'Article' && asset.assetUrl && <a href={asset.assetUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center"><ExternalLink className="w-3 h-3" /></a>}</h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={asset.isApproved} onCheckedChange={() => toggleApproval(asset.id, asset.isApproved)} /> Approved</label>
                  <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={asset.isPublic} onCheckedChange={() => toggleVisibility(asset.id, asset.isPublic)} /> Public</label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenForm(type, asset)}><Pencil className="w-4 h-4 mr-1.5"/> Edit</Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4"/></Button>
              </div>
            </div>
            {asset.content && <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{asset.content}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) return <div className="space-y-6 max-w-6xl mx-auto"><Skeleton className="h-[600px] w-full rounded-xl" /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader title="Press Assets" description="Curate approved media, headshots, and boilerplate copy for external press." primaryActionLabel="Add Asset" onPrimaryAction={() => handleOpenForm(activeTab)} />

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-2 border-b border-border bg-muted/20">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
              {['Headshot', 'Logo', 'Bio', 'Description', 'Article', 'Other'].map(tab => (
                <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-1.5 border border-transparent data-[state=active]:border-border text-sm">{tab}s</TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="p-4 md:p-6 min-h-[400px]">
            <TabsContent value="Headshot" className="mt-0 outline-none space-y-4">{renderVisualGrid('Headshot')}</TabsContent>
            <TabsContent value="Logo" className="mt-0 outline-none space-y-4">{renderVisualGrid('Logo')}</TabsContent>
            <TabsContent value="Bio" className="mt-0 outline-none space-y-4">{renderTextList('Bio')}</TabsContent>
            <TabsContent value="Description" className="mt-0 outline-none space-y-4">{renderTextList('Description')}</TabsContent>
            <TabsContent value="Article" className="mt-0 outline-none space-y-4">{renderTextList('Article')}</TabsContent>
            <TabsContent value="Other" className="mt-0 outline-none space-y-4">{renderTextList('Other')}</TabsContent>
          </div>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Asset' : `Add ${formData.assetType}`}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-2"><label className="text-sm font-medium">Title <span className="text-destructive">*</span></label><Input value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={formData.assetType} onValueChange={v => setFormData({...formData, assetType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Headshot', 'Logo', 'Bio', 'Description', 'Article', 'Other'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {(formData.assetType === 'Headshot' || formData.assetType === 'Logo' || formData.assetType === 'Article') && <div className="space-y-2"><label className="text-sm font-medium">{formData.assetType === 'Article' ? 'Article URL' : 'Image URL'}</label><Input value={formData.assetUrl || ''} onChange={e => setFormData({...formData, assetUrl: e.target.value})} /></div>}
            {(formData.assetType === 'Bio' || formData.assetType === 'Description' || formData.assetType === 'Other') && <div className="space-y-2"><label className="text-sm font-medium">Content / Text</label><Textarea value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} className="min-h-[100px]" /></div>}
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={formData.isApproved} onCheckedChange={c => setFormData({...formData, isApproved: c})} /><span className="text-sm font-medium">Approved</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={formData.isPublic} onCheckedChange={c => setFormData({...formData, isPublic: c})} /><span className="text-sm font-medium">Public</span></label>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PressAssetsModule;