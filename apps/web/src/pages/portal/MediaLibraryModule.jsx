import React, { useState, useEffect, useRef } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Copy, Pencil, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';

const MediaLibraryModule = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ title: '', fileType: '', category: '', altText: '', usageNotes: '', relatedProject: 'none' });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mediaRes, projRes] = await Promise.all([
        pb.collection('media_library').getFullList({ sort: '-created', expand: 'relatedProject', $autoCancel: false }),
        pb.collection('projects').getFullList({ sort: '-created', $autoCancel: false })
      ]);
      setMedia(mediaRes); setProjects(projRes);
    } catch (error) { toast.error('Failed to load media library'); } finally { setLoading(false); }
  };

  const handleOpenCreate = () => { setActiveItem(null); setFormData({ title: '', fileType: '', category: '', altText: '', usageNotes: '', relatedProject: 'none' }); setFile(null); setDialogOpen(true); };

  const handleOpenEdit = (item, e) => {
    e.stopPropagation(); setActiveItem(item);
    setFormData({ title: item.title || '', fileType: item.fileType || '', category: item.category || '', altText: item.altText || '', usageNotes: item.usageNotes || '', relatedProject: item.relatedProject || 'none' });
    setFile(null); setDialogOpen(true); setDetailsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Title is required');
    if (!activeItem && !file) return toast.error('File is required for new uploads');
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title); fd.append('fileType', formData.fileType); fd.append('category', formData.category); fd.append('altText', formData.altText); fd.append('usageNotes', formData.usageNotes);
      if (formData.relatedProject && formData.relatedProject !== 'none') fd.append('relatedProject', formData.relatedProject);
      else fd.append('relatedProject', '');
      if (file) fd.append('fileUrl', file);
      if (activeItem) { await pb.collection('media_library').update(activeItem.id, fd, { $autoCancel: false }); toast.success('Updated successfully'); }
      else { await pb.collection('media_library').create(fd, { $autoCancel: false }); toast.success('Uploaded successfully'); }
      setDialogOpen(false); fetchData();
    } catch (error) { toast.error('Failed to save media'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this asset? This cannot be undone.')) return;
    try {
      await pb.collection('media_library').delete(id, { $autoCancel: false }); toast.success('Media deleted');
      if (detailsModalOpen && activeItem?.id === id) setDetailsModalOpen(false);
      fetchData();
    } catch (error) { toast.error('Failed to delete media'); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;
    try {
      await Promise.all(selectedIds.map(id => pb.collection('media_library').delete(id, { $autoCancel: false })));
      toast.success(`Deleted ${selectedIds.length} items`); setSelectedIds([]); fetchData();
    } catch (err) { toast.error('Failed to delete some items'); }
  };

  const copyToClipboard = (text, e) => { if (e) e.stopPropagation(); navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); };

  const filteredMedia = media.filter(item => {
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (typeFilter !== 'all' && item.fileType !== typeFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const toggleSelectAll = () => { if (selectedIds.length === filteredMedia.length && filteredMedia.length > 0) setSelectedIds([]); else setSelectedIds(filteredMedia.map(m => m.id)); };
  const getFileUrl = (item) => item.fileUrl ? pb.files.getUrl(item, item.fileUrl) : null;

  if (loading) return <div className="space-y-6 max-w-7xl mx-auto"><Skeleton className="h-12 w-full max-w-md" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}</div></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Media Library" 
        description="Central repository for all your images, videos, and documents."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search assets..."
        primaryActionLabel="Upload Asset"
        onPrimaryAction={handleOpenCreate}
        secondaryActions={
          <>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] bg-background rounded-xl"><SelectValue placeholder="File Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Image">Image</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Audio">Audio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] bg-background rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Headshot">Headshot</SelectItem>
                <SelectItem value="Logo">Logo</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Blog">Blog</SelectItem>
                <SelectItem value="Presentation">Presentation</SelectItem>
                <SelectItem value="Press Kit">Press Kit</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-lg border border-border w-fit mb-4">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete Selected</Button>
        </div>
      )}

      {filteredMedia.length === 0 ? (
        <EmptyState 
          icon={ImageIcon}
          title="No media found"
          description="Upload images, documents, or videos to start building your media library."
          actionLabel="Upload Asset"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const url = getFileUrl(item);
            const isSelected = selectedIds.includes(item.id);
            return (
              <div key={item.id} className={`group relative bg-card border rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary border-transparent' : 'border-border hover:border-primary/30'}`} onClick={() => { setActiveItem(item); setDetailsModalOpen(true); }}>
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity data-[state=checked]:opacity-100">
                  <Checkbox checked={isSelected} onCheckedChange={(c) => setSelectedIds(prev => c ? [...prev, item.id] : prev.filter(i => i !== item.id))} onClick={e => e.stopPropagation()} className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary" />
                </div>
                <div className="aspect-square bg-muted/30 relative overflow-hidden flex items-center justify-center border-b border-border">
                  {url ? (
                    item.fileType === 'Image' || url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                      <img src={url} alt={item.altText || item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground"><ImageIcon className="w-10 h-10 mb-2 opacity-50" /><span className="text-xs font-medium uppercase tracking-wider">{item.fileType || 'FILE'}</span></div>
                    )
                  ) : <ImageIcon className="w-10 h-10 text-muted-foreground opacity-20" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={(e) => copyToClipboard(url, e)}><Copy className="w-4 h-4" /></Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={(e) => handleOpenEdit(item, e)}><Pencil className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-foreground truncate text-sm mb-1.5">{item.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {item.category && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.category}</Badge>}
                    {item.fileType && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.fileType}</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{activeItem ? 'Edit Asset' : 'Upload New Asset'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            {!activeItem && (
              <div className="space-y-2">
                <label className="text-sm font-medium">File <span className="text-destructive">*</span></label>
                <Input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files[0])} required={!activeItem} className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">File Type</label>
                <Select value={formData.fileType} onValueChange={v => setFormData({...formData, fileType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Image">Image</SelectItem><SelectItem value="Video">Video</SelectItem><SelectItem value="Document">Document</SelectItem><SelectItem value="Audio">Audio</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Headshot">Headshot</SelectItem><SelectItem value="Logo">Logo</SelectItem><SelectItem value="Social Media">Social Media</SelectItem><SelectItem value="Blog">Blog</SelectItem><SelectItem value="Presentation">Presentation</SelectItem><SelectItem value="Press Kit">Press Kit</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Alt Text</label><Input value={formData.altText} onChange={e => setFormData({...formData, altText: e.target.value})} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Related Project</label>
              <Select value={formData.relatedProject} onValueChange={v => setFormData({...formData, relatedProject: v})}>
                <SelectTrigger><SelectValue placeholder="Link to a project" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Usage Notes</label><Textarea value={formData.usageNotes} onChange={e => setFormData({...formData, usageNotes: e.target.value})} className="h-20" /></div>
            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : activeItem ? 'Save Changes' : 'Upload Asset'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0 bg-card">
          {activeItem && (
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              <div className="w-full md:w-3/5 bg-muted/30 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border relative">
                {getFileUrl(activeItem) ? (
                  activeItem.fileType === 'Image' || getFileUrl(activeItem).match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? <img src={getFileUrl(activeItem)} alt={activeItem.altText} className="max-w-full max-h-full object-contain drop-shadow-md rounded-md" /> : <div className="text-center p-12 bg-background rounded-lg shadow-sm border border-border"><ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><p className="font-medium text-lg mb-2">{activeItem.title}</p><Button variant="outline" onClick={() => window.open(getFileUrl(activeItem), '_blank')}><Download className="w-4 h-4 mr-2" /> Download File</Button></div>
                ) : <ImageIcon className="w-16 h-16 text-muted-foreground opacity-20" />}
              </div>
              <div className="w-full md:w-2/5 flex flex-col bg-card">
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  <div><h2 className="text-xl font-bold text-foreground mb-3 leading-tight">{activeItem.title}</h2><div className="flex flex-wrap gap-2 mb-4">{activeItem.category && <Badge variant="secondary">{activeItem.category}</Badge>}{activeItem.fileType && <Badge variant="outline">{activeItem.fileType}</Badge>}</div></div>
                  <div className="space-y-4 text-sm">
                    {activeItem.altText && <div><p className="text-muted-foreground font-medium mb-1">Alt Text</p><p className="text-foreground bg-muted/30 p-3 rounded-lg border border-border leading-relaxed">{activeItem.altText}</p></div>}
                    {activeItem.usageNotes && <div><p className="text-muted-foreground font-medium mb-1">Usage Notes</p><p className="text-foreground bg-muted/30 p-3 rounded-lg border border-border leading-relaxed whitespace-pre-wrap">{activeItem.usageNotes}</p></div>}
                    {activeItem.expand?.relatedProject && <div><p className="text-muted-foreground font-medium mb-1">Related Project</p><div className="flex items-center text-primary font-medium">{activeItem.expand.relatedProject.title}</div></div>}
                  </div>
                </div>
                <div className="p-4 border-t border-border bg-muted/10 flex flex-col gap-2">
                  <Button className="w-full" onClick={() => copyToClipboard(getFileUrl(activeItem))}><Copy className="w-4 h-4 mr-2" /> Copy Asset URL</Button>
                  <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={(e) => handleOpenEdit(activeItem, e)}><Pencil className="w-4 h-4 mr-2" /> Edit</Button><Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-border" onClick={(e) => handleDelete(activeItem.id, e)}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibraryModule;