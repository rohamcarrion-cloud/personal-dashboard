import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CampaignForm = ({ initialData, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    objective: initialData?.objective || '',
    relatedProject: initialData?.relatedProject || 'none',
    contentPillar: initialData?.contentPillar || '',
    targetAudience: initialData?.targetAudience || '',
    callToAction: initialData?.callToAction || '',
    startDate: initialData?.startDate ? initialData.startDate.substring(0, 16) : '',
    endDate: initialData?.endDate ? initialData.endDate.substring(0, 16) : '',
    status: initialData?.status || 'Planning',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await pb.collection('projects').getFullList({ sort: '-created', $autoCancel: false });
        setProjects(res);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = { ...formData };
      if (dataToSave.relatedProject === 'none') {
        dataToSave.relatedProject = null;
      }
      
      // Ensure dates are valid ISO strings if provided
      if (dataToSave.startDate) {
        dataToSave.startDate = new Date(dataToSave.startDate).toISOString();
      }
      if (dataToSave.endDate) {
        dataToSave.endDate = new Date(dataToSave.endDate).toISOString();
      }

      if (initialData?.id) {
        await pb.collection('campaigns').update(initialData.id, dataToSave, { $autoCancel: false });
        toast.success('Campaign updated successfully');
      } else {
        await pb.collection('campaigns').create(dataToSave, { $autoCancel: false });
        toast.success('Campaign created successfully');
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save campaign. Please check required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Campaign Name <span className="text-destructive">*</span></label>
          <Input required value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g., Q4 Product Launch" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Related Project</label>
          <Select value={formData.relatedProject} onValueChange={v => handleChange('relatedProject', v)}>
            <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Objective <span className="text-destructive">*</span></label>
        <Textarea required value={formData.objective} onChange={e => handleChange('objective', e.target.value)} placeholder="What is the goal of this campaign?" className="min-h-[80px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Content Pillar <span className="text-destructive">*</span></label>
          <Select required value={formData.contentPillar} onValueChange={v => handleChange('contentPillar', v)}>
            <SelectTrigger><SelectValue placeholder="Select pillar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Thought Leadership">Thought Leadership</SelectItem>
              <SelectItem value="Product Update">Product Update</SelectItem>
              <SelectItem value="Case Study">Case Study</SelectItem>
              <SelectItem value="Industry News">Industry News</SelectItem>
              <SelectItem value="Behind-the-Scenes">Behind-the-Scenes</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status <span className="text-destructive">*</span></label>
          <Select required value={formData.status} onValueChange={v => handleChange('status', v)}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Audience <span className="text-destructive">*</span></label>
          <Input required value={formData.targetAudience} onChange={e => handleChange('targetAudience', e.target.value)} placeholder="e.g., Enterprise IT Directors" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Call to Action <span className="text-destructive">*</span></label>
          <Input required value={formData.callToAction} onChange={e => handleChange('callToAction', e.target.value)} placeholder="e.g., Book a demo" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date & Time <span className="text-destructive">*</span></label>
          <Input required type="datetime-local" value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date & Time <span className="text-destructive">*</span></label>
          <Input required type="datetime-local" value={formData.endDate} onChange={e => handleChange('endDate', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Update Campaign' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
};

export default CampaignForm;