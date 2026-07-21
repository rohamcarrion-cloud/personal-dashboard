import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ProjectForm = ({ project, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    status: 'Idea',
    priority: 'Medium',
    publicVisibility: true,
    timeline: '',
    tasks: '',
    notes: '',
    relatedUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        slug: project.slug || '',
        description: project.description || '',
        category: project.category || '',
        status: project.status || 'Idea',
        priority: project.priority || 'Medium',
        publicVisibility: project.publicVisibility ?? true,
        timeline: project.timeline || '',
        tasks: project.tasks || '',
        notes: project.notes || '',
        relatedUrl: project.relatedUrl || ''
      });
    }
  }, [project]);

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: !project ? generateSlug(title) : prev.slug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error('Title and Slug are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (project) {
        await pb.collection('projects').update(project.id, formData, { $autoCancel: false });
      } else {
        await pb.collection('projects').create(formData, { $autoCancel: false });
      }
      
      toast.success(project ? 'Project updated successfully' : 'Project created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project Title <span className="text-destructive">*</span></Label>
          <Input 
            value={formData.title} 
            onChange={handleTitleChange} 
            placeholder="e.g., Q3 Marketing Campaign"
          />
        </div>
        <div className="space-y-2">
          <Label>URL Slug <span className="text-destructive">*</span></Label>
          <Input 
            value={formData.slug} 
            onChange={e => setFormData({...formData, slug: e.target.value})} 
            placeholder="q3-marketing-campaign"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          className="min-h-[100px]"
          placeholder="Brief overview of the project..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Idea">Idea</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Input 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})} 
            placeholder="e.g., Marketing"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Timeline</Label>
          <Input 
            value={formData.timeline} 
            onChange={e => setFormData({...formData, timeline: e.target.value})} 
            placeholder="e.g., Q3 2024"
          />
        </div>
        <div className="space-y-2">
          <Label>Related URL</Label>
          <Input 
            type="url"
            value={formData.relatedUrl} 
            onChange={e => setFormData({...formData, relatedUrl: e.target.value})} 
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tasks / Next Steps</Label>
        <Textarea 
          value={formData.tasks} 
          onChange={e => setFormData({...formData, tasks: e.target.value})} 
          className="min-h-[80px]"
          placeholder="List key tasks..."
        />
      </div>

      <div className="space-y-2">
        <Label>Internal Notes</Label>
        <Textarea 
          value={formData.notes} 
          onChange={e => setFormData({...formData, notes: e.target.value})} 
          className="min-h-[80px]"
          placeholder="Private notes..."
        />
      </div>

      <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl border border-border">
        <Switch 
          id="publicVisibility" 
          checked={formData.publicVisibility} 
          onCheckedChange={(checked) => setFormData({...formData, publicVisibility: checked})} 
        />
        <div className="space-y-0.5">
          <Label htmlFor="publicVisibility" className="text-base">Publicly Visible</Label>
          <p className="text-sm text-muted-foreground">If enabled, this project will appear on the public /projects page.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;