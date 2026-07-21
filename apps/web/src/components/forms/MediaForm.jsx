import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const MediaForm = ({ media, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fileType: '',
    category: '',
    altText: '',
    usageNotes: '',
    relatedProject: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || '',
        fileType: media.fileType || '',
        category: media.category || '',
        altText: media.altText || '',
        usageNotes: media.usageNotes || '',
        relatedProject: media.relatedProject || '',
      });
    }
  }, [media]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (file) {
        data.append('fileUrl', file);
      }

      if (media) {
        await pb.collection('media_library').update(media.id, data, { $autoCancel: false });
        toast.success('Media updated');
      } else {
        await pb.collection('media_library').create(data, { $autoCancel: false });
        toast.success('Media created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fileUrl">File *</Label>
        <Input
          id="fileUrl"
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required={!media}
          className="text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fileType">File Type</Label>
          <Input
            id="fileType"
            value={formData.fileType}
            onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
            placeholder="Image, Video, Document"
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Brand Assets, Blog Images, etc."
            className="text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="altText">Alt Text</Label>
        <Input
          id="altText"
          value={formData.altText}
          onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
          placeholder="Descriptive text for accessibility"
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="usageNotes">Usage Notes</Label>
        <Textarea
          id="usageNotes"
          value={formData.usageNotes}
          onChange={(e) => setFormData({ ...formData, usageNotes: e.target.value })}
          rows={3}
          placeholder="Where and how this media is used"
          className="text-foreground"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : media ? 'Update Media' : 'Create Media'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MediaForm;