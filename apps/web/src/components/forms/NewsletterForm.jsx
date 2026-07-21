import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const NewsletterForm = ({ campaign, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    audience: '',
    subjectLine: '',
    previewText: '',
    body: '',
    status: 'Draft',
    scheduledDate: '',
    sentDate: '',
    relatedBlogPost: '',
    relatedProject: '',
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || '',
        audience: campaign.audience || '',
        subjectLine: campaign.subjectLine || '',
        previewText: campaign.previewText || '',
        body: campaign.body || '',
        status: campaign.status || 'Draft',
        scheduledDate: campaign.scheduledDate || '',
        sentDate: campaign.sentDate || '',
        relatedBlogPost: campaign.relatedBlogPost || '',
        relatedProject: campaign.relatedProject || '',
      });
    }
  }, [campaign]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (campaign) {
        await pb.collection('newsletter_campaigns').update(campaign.id, formData, { $autoCancel: false });
        toast.success('Newsletter campaign updated');
      } else {
        await pb.collection('newsletter_campaigns').create(formData, { $autoCancel: false });
        toast.success('Newsletter campaign created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save newsletter campaign');
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
        <Label htmlFor="audience">Audience</Label>
        <Input
          id="audience"
          value={formData.audience}
          onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
          placeholder="All subscribers, Segment A, etc."
          className="text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subjectLine">Subject Line</Label>
          <Input
            id="subjectLine"
            value={formData.subjectLine}
            onChange={(e) => setFormData({ ...formData, subjectLine: e.target.value })}
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="previewText">Preview Text</Label>
          <Input
            id="previewText"
            value={formData.previewText}
            onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
            className="text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={8}
          className="text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger className="text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          <Label htmlFor="sentDate">Sent Date</Label>
          <Input
            id="sentDate"
            type="date"
            value={formData.sentDate}
            onChange={(e) => setFormData({ ...formData, sentDate: e.target.value })}
            className="text-foreground"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default NewsletterForm;