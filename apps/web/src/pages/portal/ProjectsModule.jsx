import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, FolderKanban, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ProjectForm from '@/components/forms/ProjectForm.jsx';
import { format } from 'date-fns';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';

const ProjectsModule = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, statusFilter, priorityFilter]);

  const fetchProjects = async () => {
    try {
      let filter = '';
      const filters = [];
      
      if (searchTerm) filters.push(`title ~ "${searchTerm}"`);
      if (statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
      if (priorityFilter !== 'all') filters.push(`priority = "${priorityFilter}"`);
      
      if (filters.length > 0) filter = filters.join(' && ');

      const records = await pb.collection('projects').getFullList({ filter, sort: '-created', $autoCancel: false });
      setProjects(records);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load projects');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await pb.collection('projects').delete(id, { $autoCancel: false });
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedProject(null);
    fetchProjects();
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'High': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Low': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="space-y-4 max-w-7xl mx-auto"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 rounded-xl" /></div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Projects" 
        description="Manage your ongoing initiatives and track progress."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search projects..."
        primaryActionLabel="New Project"
        onPrimaryAction={() => { setSelectedProject(null); setDialogOpen(true); }}
        secondaryActions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Idea">Idea</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background rounded-xl">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {projects.length === 0 ? (
        <EmptyState 
          icon={FolderKanban}
          title="No projects found"
          description="Start tracking your work by creating a new project."
          actionLabel="Create Project"
          onAction={() => { setSelectedProject(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:shadow-md transition-all duration-300 border-border overflow-hidden flex flex-col rounded-lg shadow-sm">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <StatusBadge status={project.status} />
                    {project.category && (
                      <Badge variant="secondary" className="font-medium px-2.5 py-0.5 bg-muted">
                        {project.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => { setSelectedProject(project); setDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold leading-tight line-clamp-2 mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="space-y-3 pt-4 border-t border-border mt-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      {getPriorityIcon(project.priority)} {project.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{format(new Date(project.created), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'Edit Project' : 'Create Project'}</DialogTitle>
          </DialogHeader>
          <ProjectForm project={selectedProject} onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsModule;