import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const EventForm = ({ event, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    eventType: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    registrationLink: '',
    description: '',
    speakerNotes: '',
    promotionChecklist: '',
    status: 'Planning',
    followUpTasks: '',
    publicVisibility: false,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        slug: event.slug || '',
        eventType: event.eventType || '',
        date: event.date || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        location: event.location || '',
        registrationLink: event.registrationLink || '',
        description: event.description || '',
        speakerNotes: event.speakerNotes || '',
        promotionChecklist: event.promotionChecklist || '',
        status: event.status || 'Planning',
        followUpTasks: event.followUpTasks || '',
        publicVisibility: event.publicVisibility || false,
      });
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (event) {
        await pb.collection('events').update(event.id, formData, { $autoCancel: false });
        toast.success('Event updated');
      } else {
        await pb.collection('events').create(formData, { $autoCancel: false });
        toast.success('Event created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            className="text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type</Label>
          <Input
            id="eventType"
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            placeholder="Workshop, Webinar, Conference"
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger className="text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Virtual or physical address"
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationLink">Registration Link</Label>
          <Input
            id="registrationLink"
            type="url"
            value={formData.registrationLink}
            onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
            placeholder="https://"
            className="text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="speakerNotes">Speaker Notes</Label>
        <Textarea
          id="speakerNotes"
          value={formData.speakerNotes}
          onChange={(e) => setFormData({ ...formData, speakerNotes: e.target.value })}
          rows={2}
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="promotionChecklist">Promotion Checklist</Label>
        <Textarea
          id="promotionChecklist"
          value={formData.promotionChecklist}
          onChange={(e) => setFormData({ ...formData, promotionChecklist: e.target.value })}
          rows={2}
          placeholder="Social media posts, email campaign, etc."
          className="text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="followUpTasks">Follow-up Tasks</Label>
        <Textarea
          id="followUpTasks"
          value={formData.followUpTasks}
          onChange={(e) => setFormData({ ...formData, followUpTasks: e.target.value })}
          rows={2}
          className="text-foreground"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="publicVisibility"
          checked={formData.publicVisibility}
          onCheckedChange={(checked) => setFormData({ ...formData, publicVisibility: checked })}
        />
        <Label htmlFor="publicVisibility" className="cursor-pointer">
          Public Visibility
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EventForm;