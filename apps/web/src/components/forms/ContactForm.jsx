import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ContactForm = ({ contact, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    contactType: 'not_set',
    relationshipStatus: '',
    notes: '',
    followUpDate: '',
    opportunityValue: '',
    relatedProject: '',
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        organization: contact.organization || '',
        email: contact.email || '',
        phone: contact.phone || '',
        contactType: contact.contactType || 'not_set',
        relationshipStatus: contact.relationshipStatus || '',
        notes: contact.notes || '',
        followUpDate: contact.followUpDate || '',
        opportunityValue: contact.opportunityValue || '',
        relatedProject: contact.relatedProject || '',
      });
    }
  }, [contact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData };
      if (data.opportunityValue) {
        data.opportunityValue = parseFloat(data.opportunityValue);
      }
      if (data.contactType === 'not_set') {
        data.contactType = '';
      }

      if (contact) {
        await pb.collection('contacts_opportunities').update(contact.id, data, { $autoCancel: false });
        toast.success('Contact updated');
      } else {
        await pb.collection('contacts_opportunities').create(data, { $autoCancel: false });
        toast.success('Contact created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            className="text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactType">Contact Type</Label>
          <Select value={formData.contactType} onValueChange={(value) => setFormData({ ...formData, contactType: value })}>
            <SelectTrigger className="text-foreground">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_set">Not Set</SelectItem>
              <SelectItem value="Investor">Investor</SelectItem>
              <SelectItem value="Reporter">Reporter</SelectItem>
              <SelectItem value="Sponsor">Sponsor</SelectItem>
              <SelectItem value="Partner">Partner</SelectItem>
              <SelectItem value="Podcast Guest">Podcast Guest</SelectItem>
              <SelectItem value="Event Organizer">Event Organizer</SelectItem>
              <SelectItem value="Real Estate Contact">Real Estate Contact</SelectItem>
              <SelectItem value="Client Lead">Client Lead</SelectItem>
              <SelectItem value="General Contact">General Contact</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationshipStatus">Relationship Status</Label>
          <Input
            id="relationshipStatus"
            value={formData.relationshipStatus}
            onChange={(e) => setFormData({ ...formData, relationshipStatus: e.target.value })}
            placeholder="New, Active, Warm, Cold"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="opportunityValue">Opportunity Value</Label>
          <Input
            id="opportunityValue"
            type="number"
            step="0.01"
            value={formData.opportunityValue}
            onChange={(e) => setFormData({ ...formData, opportunityValue: e.target.value })}
            placeholder="0.00"
            className="text-foreground"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;