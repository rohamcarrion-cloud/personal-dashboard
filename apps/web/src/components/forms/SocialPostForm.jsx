import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const SocialPostForm = ({ post, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    masterContent: '',
    platformCaptions: '',
    platforms: '',
    hashtags: '',
    mediaUrl: '',
    link: '',
    contentType: 'Text',
    status: 'Draft',
    scheduledDate: '',
    publishedDate: '',
    notes: '',
    relatedBlogPost: '',
    relatedProject: '',
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        masterContent: post.masterContent || '',
        platformCaptions: post.platformCaptions || '',
        platforms: post.platforms || '',
        hashtags: post.hashtags || '',
        mediaUrl: post.mediaUrl || '',
        link: post.link || '',
        contentType: post.contentType || 'Text',
        status: post.status || 'Draft',
        scheduledDate: post.scheduledDate || '',
        publishedDate: post.publishedDate || '',
        notes: post.notes || '',
        relatedBlogPost: post.relatedBlogPost || '',
        relatedProject: post.relatedProject || '',
      });
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (post) {
        await pb.collection('social_posts').update(post.id, formData, { $autoCancel: false });
        toast.success('Social post updated');
      } else {
        await pb.collection('social_posts').create(formData, { $autoCancel: false });
        toast.success('Social post created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save social post');
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
        <Label htmlFor="masterContent">Master Content</Label>
        <Textarea
          id="masterContent"
          value={formData.masterContent}
          onChange={(e) => setFormData({ ...formData, masterContent: e.target.value })}
          rows={4}
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platformCaptions">Platform-Specific Captions</Label>
        <Textarea
          id="platformCaptions"
          value={formData.platformCaptions}
          onChange={(e) => setFormData({ ...formData, platformCaptions: e.target.value })}
          rows={3}
          placeholder="Instagram: ..., Twitter: ..., LinkedIn: ..."
          className="text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="platforms">Platforms</Label>
          <Input
            id="platforms"
            value={formData.platforms}
            onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
            placeholder="Instagram, Twitter, LinkedIn"
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hashtags">Hashtags</Label>
          <Input
            id="hashtags"
            value={formData.hashtags}
            onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
            placeholder="#tag1, #tag2"
            className="text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mediaUrl">Media URL</Label>
          <Input
            id="mediaUrl"
            value={formData.mediaUrl}
            onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
            placeholder="https://"
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://"
            className="text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contentType">Content Type *</Label>
          <Select value={formData.contentType} onValueChange={(value) => setFormData({ ...formData, contentType: value })}>
            <SelectTrigger className="text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Text">Text</SelectItem>
              <SelectItem value="Image">Image</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Reel">Reel</SelectItem>
              <SelectItem value="Short">Short</SelectItem>
              <SelectItem value="Carousel">Carousel</SelectItem>
              <SelectItem value="Article">Article</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger className="text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Scheduled Date</Label>
          <Input
            id="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedDate">Published Date</Label>
          <Input
            id="publishedDate"
            type="date"
            value={formData.publishedDate}
            onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
            className="text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="text-foreground"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default SocialPostForm;