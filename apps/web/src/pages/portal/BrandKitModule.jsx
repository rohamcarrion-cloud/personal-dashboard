import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Copy, Palette, Type, Link as LinkIcon, User, Image as ImageIcon, Briefcase, AtSign, Phone } from 'lucide-react';
import { toast } from 'sonner';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';

const BrandKitModule = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Logos');
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchBrandKit(); }, []);

  const fetchBrandKit = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('brand_kit').getFullList({ sort: 'order,-created', $autoCancel: false });
      setAssets(records);
    } catch (error) { toast.error('Failed to load brand kit'); } finally { setLoading(false); }
  };

  const getAssetsBySection = (section) => assets.filter(a => a.section === section);

  const openForm = (section, item = null) => {
    setActiveSection(section); setEditItem(item);
    if (item) setFormData({ ...item });
    else setFormData({ section, title: '', content: '', assetUrl: '', colorHex: '', colorName: '', fontFamily: '', fontSize: '', fontWeight: '', isPublic: true, order: getAssetsBySection(section).length + 1 });
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Title is required');
    try {
      if (editItem) await pb.collection('brand_kit').update(editItem.id, formData, { $autoCancel: false });
      else await pb.collection('brand_kit').create(formData, { $autoCancel: false });
      toast.success('Asset saved'); setDialogOpen(false); fetchBrandKit();
    } catch (error) { toast.error('Failed to save asset'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand asset?')) return;
    try { await pb.collection('brand_kit').delete(id, { $autoCancel: false }); toast.success('Asset deleted'); fetchBrandKit(); } catch (error) { toast.error('Failed to delete asset'); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); };

  const renderSectionHeader = (title, description, section, icon) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">{icon}</div>
        <div><h2 className="text-xl font-bold">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></div>
      </div>
      <Button onClick={() => openForm(section)} size="sm"><Plus className="w-4 h-4 mr-2"/> Add {title}</Button>
    </div>
  );

  if (loading) return <div className="space-y-6 max-w-6xl mx-auto"><Skeleton className="h-[600px] w-full rounded-xl" /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader title="Brand Kit" description="Manage your core brand assets, colors, typography, and messaging." />

      <Tabs defaultValue="Logos" className="w-full bg-card border border-border rounded-xl shadow-sm p-1">
        <div className="p-2 border-b border-border bg-muted/20">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
            {['Logos', 'Colors', 'Typography', 'Bios', 'Mission', 'Handles', 'Contact'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-1.5 border border-transparent data-[state=active]:border-border text-sm">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-4 md:p-6 min-h-[400px]">
          <TabsContent value="Logos" className="mt-0 outline-none">
            {renderSectionHeader('Logos', 'Official brand logos and marks.', 'Logos', <ImageIcon className="w-4 h-4"/>)}
            {getAssetsBySection('Logos').length === 0 ? <EmptyState icon={ImageIcon} title="No logos" description="Add your first logo." actionLabel="Add Logo" onAction={() => openForm('Logos')} /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAssetsBySection('Logos').map(asset => (
                  <Card key={asset.id} className="overflow-hidden group border-border rounded-lg shadow-sm">
                    <div className="aspect-video bg-muted/40 p-6 flex items-center justify-center relative border-b border-border checkerboard-pattern">
                      {asset.assetUrl ? <img src={asset.assetUrl} alt={asset.title} className="max-w-full max-h-full object-contain" /> : <ImageIcon className="w-10 h-10 text-muted-foreground opacity-30" />}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(asset.assetUrl)}><Copy className="w-4 h-4"/></Button>
                        <Button size="icon" variant="outline" onClick={() => openForm('Logos', asset)}><Pencil className="w-4 h-4"/></Button>
                        <Button size="icon" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </div>
                    <CardContent className="p-3"><h3 className="font-semibold text-sm">{asset.title}</h3>{!asset.isPublic && <Badge variant="secondary" className="text-[10px]">Private</Badge>}</CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="Colors" className="mt-0 outline-none">
            {renderSectionHeader('Brand Colors', 'Primary and secondary brand palettes.', 'Colors', <Palette className="w-4 h-4"/>)}
            {getAssetsBySection('Colors').length === 0 ? <EmptyState icon={Palette} title="No colors" description="Define your brand colors." actionLabel="Add Color" onAction={() => openForm('Colors')} /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getAssetsBySection('Colors').map(asset => (
                  <div key={asset.id} className="group relative rounded-lg overflow-hidden border border-border bg-card shadow-sm">
                    <div className="h-24 w-full" style={{ backgroundColor: asset.colorHex || '#e5e7eb' }} />
                    <div className="p-3"><h3 className="font-bold text-sm">{asset.title}</h3><div className="flex items-center justify-between"><p className="text-muted-foreground font-mono text-xs uppercase">{asset.colorHex}</p><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(asset.colorHex)}><Copy className="w-3 h-3"/></Button></div></div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"><Button size="icon" variant="secondary" className="h-7 w-7 rounded-md" onClick={() => openForm('Colors', asset)}><Pencil className="w-3 h-3"/></Button><Button size="icon" variant="destructive" className="h-7 w-7 rounded-md" onClick={() => handleDelete(asset.id)}><Trash2 className="w-3 h-3"/></Button></div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="Typography" className="mt-0 outline-none">
            {renderSectionHeader('Typography', 'Brand fonts and usage guidelines.', 'Typography', <Type className="w-4 h-4"/>)}
            {getAssetsBySection('Typography').length === 0 ? <EmptyState icon={Type} title="No typography" description="Add your fonts." actionLabel="Add Typography" onAction={() => openForm('Typography')} /> : (
              <div className="space-y-4">
                {getAssetsBySection('Typography').map(asset => (
                  <Card key={asset.id} className="border-border rounded-lg shadow-sm">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex-1"><div className="flex items-center gap-2 mb-2"><h3 className="font-bold text-lg">{asset.title}</h3><Badge variant="outline">{asset.fontFamily}</Badge></div><p className="text-2xl" style={{ fontFamily: asset.fontFamily, fontWeight: asset.fontWeight }}>The quick brown fox jumps over the lazy dog.</p></div>
                      <div className="flex items-center gap-2 shrink-0"><Button variant="outline" size="sm" onClick={() => openForm('Typography', asset)}><Pencil className="w-4 h-4 mr-1.5"/> Edit</Button><Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4"/></Button></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="Bios" className="mt-0 outline-none">
            {renderSectionHeader('Company & Executive Bios', 'Standardized biographies.', 'Bios', <User className="w-4 h-4"/>)}
            {getAssetsBySection('Bios').length === 0 ? <EmptyState icon={User} title="No bios" description="Add your bios." actionLabel="Add Bio" onAction={() => openForm('Bios')} /> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {getAssetsBySection('Bios').map(asset => (
                  <Card key={asset.id} className="border-border flex flex-col h-full rounded-lg shadow-sm">
                    <CardHeader className="pb-3 bg-muted/10 p-4 border-b border-border"><CardTitle className="flex justify-between items-center text-lg"><span>{asset.title}</span><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => copyToClipboard(asset.content)}><Copy className="w-4 h-4 text-muted-foreground"/></Button><Button size="icon" variant="ghost" onClick={() => openForm('Bios', asset)}><Pencil className="w-4 h-4 text-muted-foreground"/></Button><Button size="icon" variant="ghost" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button></div></CardTitle></CardHeader>
                    <CardContent className="p-4 flex-1 text-muted-foreground whitespace-pre-wrap text-sm">{asset.content}</CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="Mission" className="mt-0 outline-none">
            {renderSectionHeader('Mission & Vision', 'Core brand statements.', 'Mission', <Briefcase className="w-4 h-4"/>)}
            {getAssetsBySection('Mission').length === 0 ? <EmptyState icon={Briefcase} title="No mission statements" description="Add your mission." actionLabel="Add Mission" onAction={() => openForm('Mission')} /> : (
              <div className="space-y-4">
                {getAssetsBySection('Mission').map(asset => (
                  <Card key={asset.id} className="border-border rounded-lg shadow-sm">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Briefcase className="w-6 h-6"/></div>
                      <div className="flex-1"><h3 className="font-bold text-lg mb-2 text-foreground">{asset.title}</h3><p className="text-base text-muted-foreground italic border-l-2 border-primary/30 pl-4 py-1">"{asset.content}"</p><div className="mt-4 flex gap-2"><Button variant="outline" size="sm" onClick={() => copyToClipboard(asset.content)}><Copy className="w-4 h-4 mr-1.5"/> Copy</Button><Button variant="outline" size="sm" onClick={() => openForm('Mission', asset)}><Pencil className="w-4 h-4 mr-1.5"/> Edit</Button><Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4"/></Button></div></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="Handles" className="mt-0 outline-none">
            {renderSectionHeader('Social Handles', 'Official social links.', 'Handles', <AtSign className="w-4 h-4"/>)}
            {getAssetsBySection('Handles').length === 0 ? <EmptyState icon={AtSign} title="No handles" description="Add social handles." actionLabel="Add Handle" onAction={() => openForm('Handles')} /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAssetsBySection('Handles').map(asset => (
                  <Card key={asset.id} className="border-border flex items-center justify-between p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden"><div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><LinkIcon className="w-4 h-4 text-muted-foreground"/></div><div className="min-w-0"><p className="font-semibold text-sm">{asset.title}</p><p className="text-xs text-muted-foreground truncate max-w-[150px]">{asset.assetUrl}</p></div></div>
                    <div className="flex shrink-0"><Button size="icon" variant="ghost" onClick={() => copyToClipboard(asset.assetUrl)}><Copy className="w-4 h-4"/></Button><Button size="icon" variant="ghost" onClick={() => openForm('Handles', asset)}><Pencil className="w-4 h-4"/></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4"/></Button></div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="Contact" className="mt-0 outline-none">
            {renderSectionHeader('Contact Info', 'Official press and general contact details.', 'Contact', <Phone className="w-4 h-4"/>)}
            {getAssetsBySection('Contact').length === 0 ? <EmptyState icon={Phone} title="No contact info" description="Add contact details." actionLabel="Add Contact" onAction={() => openForm('Contact')} /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAssetsBySection('Contact').map(asset => (
                  <Card key={asset.id} className="border-border rounded-lg shadow-sm">
                    <CardHeader className="pb-2 p-4 border-b border-border/50 bg-muted/10"><CardTitle className="text-base flex justify-between">{asset.title}<div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openForm('Contact', asset)}><Pencil className="w-3 h-3 text-muted-foreground"/></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(asset.id)}><Trash2 className="w-3 h-3 text-destructive"/></Button></div></CardTitle></CardHeader>
                    <CardContent className="p-4"><p className="text-sm text-muted-foreground whitespace-pre-wrap">{asset.content}</p></CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Asset' : `Add to ${activeSection}`}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-2"><label className="text-sm font-medium">Title <span className="text-destructive">*</span></label><Input value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
            {(activeSection === 'Logos' || activeSection === 'Handles') && <div className="space-y-2"><label className="text-sm font-medium">URL</label><Input value={formData.assetUrl || ''} onChange={e => setFormData({...formData, assetUrl: e.target.value})} /></div>}
            {activeSection === 'Colors' && <div className="space-y-2"><label className="text-sm font-medium">Color Hex</label><div className="flex gap-2"><div className="w-10 h-10 rounded border" style={{ backgroundColor: formData.colorHex || '#ffffff' }} /><Input value={formData.colorHex || ''} onChange={e => setFormData({...formData, colorHex: e.target.value})} /></div></div>}
            {activeSection === 'Typography' && <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-sm font-medium">Font Family</label><Input value={formData.fontFamily || ''} onChange={e => setFormData({...formData, fontFamily: e.target.value})} /></div><div className="space-y-2"><label className="text-sm font-medium">Font Weight</label><Input value={formData.fontWeight || ''} onChange={e => setFormData({...formData, fontWeight: e.target.value})} /></div></div>}
            {(activeSection === 'Bios' || activeSection === 'Mission' || activeSection === 'Contact') && <div className="space-y-2"><label className="text-sm font-medium">Content</label><Textarea value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} className="min-h-[100px]" /></div>}
            <div className="flex items-center space-x-2 pt-2"><Checkbox id="isPublic" checked={formData.isPublic} onCheckedChange={c => setFormData({...formData, isPublic: c})} /><label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">Visible on Public Media Kit</label></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandKitModule;