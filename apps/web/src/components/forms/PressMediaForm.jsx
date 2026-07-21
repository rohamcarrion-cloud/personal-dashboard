import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const PressMediaForm = ({ item, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    outlet: '',
    contactName: '',
    email: '',
    pitchTopic: '',
    pitchStatus: 'Idea',
    dateSent: '',
    followUpDate: '',
    notes: '',
    relatedContent: '',
    publishedUrl: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        outlet: item.outlet || '',
        contactName: item.contactName || '',
        email: item.email || '',
        pitchTopic: item.pitchTopic || '',
        pitchStatus: item.pitchStatus || 'Idea',
        dateSent: item.dateSent || '',
        followUpDate: item.followUpDate || '',
        notes: item.notes || '',
        relatedContent: item.relatedContent || '',
        publishedUrl: item.publishedUrl || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await pb.collection('press_media').update(item.id, formData, { $autoCancel: false });
        toast.success('Press item updated');
      } else {
        await pb.collection('press_media').create(formData, { $autoCancel: false });
        toast.success('Press item created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save press item');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="outlet">Outlet</Label>
          <Input
            id="outlet"
            value={formData.outlet}
            onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
            placeholder="Publication name"
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            className="text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pitchTopic">Pitch Topic</Label>
        <Input
          id="pitchTopic"
          value={formData.pitchTopic}
          onChange={(e) => setFormData({ ...formData, pitchTopic: e.target.value })}
          className="text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pitchStatus">Pitch Status *</Label>
          <Select value={formData.pitchStatus} onValueChange={(value) => setFormData({ ...formData, pitchStatus: value })}>
            <SelectTrigger className="text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Idea">Idea</SelectItem>
              <SelectItem value="Drafted">Drafted</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Followed Up">Followed Up</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateSent">Date Sent</Label>
          <Input
            id="dateSent"
            type="date"
            value={formData.dateSent}
            onChange={(e) => setFormData({ ...formData, dateSent: e.target.value })}
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="followUpDate">Follow-up Date</Label>
          <Input
            id="followUpDate"
            type="date"
            value={formData.followUpDate}
            onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
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
          rows={3}
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relatedContent">Related Content</Label>
        <Input
          id="relatedContent"
          value={formData.relatedContent}
          onChange={(e) => setFormData({ ...formData, relatedContent: e.target.value })}
          placeholder="Links to related blog posts, projects"
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publishedUrl">Published URL</Label>
        <Input
          id="publishedUrl"
          type="url"
          value={formData.publishedUrl}
          onChange={(e) => setFormData({ ...formData, publishedUrl: e.target.value })}
          placeholder="https://"
          className="text-foreground"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PressMediaForm;