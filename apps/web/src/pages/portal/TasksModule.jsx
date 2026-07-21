import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { CheckSquare, Calendar, Trash2, Pencil, CheckCircle2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { toast } from 'sonner';
import TaskSuggestionsPanel from '@/components/TaskSuggestionsPanel.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';

const TasksModule = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '',
  });

  useEffect(() => {
    fetchTasks();
  }, [searchTerm, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      let filter = '';
      const filters = [];
      if (searchTerm) filters.push(`title ~ "${searchTerm}"`);
      if (statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
      if (priorityFilter !== 'all') filters.push(`priority = "${priorityFilter}"`);
      if (filters.length > 0) filter = filters.join(' && ');

      const records = await pb.collection('tasks').getFullList({ filter, sort: 'dueDate,-created', $autoCancel: false });
      setTasks(records);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (item = null) => {
    setEditItem(item);
    if (item) {
      setFormData({
        title: item.title || '', description: item.description || '', status: item.status || 'To Do',
        priority: item.priority || 'Medium', dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({ title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Title is required');

    setIsSubmitting(true);
    try {
      const dataToSave = { ...formData };
      dataToSave.dueDate = dataToSave.dueDate ? new Date(dataToSave.dueDate).toISOString() : '';

      if (editItem) await pb.collection('tasks').update(editItem.id, dataToSave, { $autoCancel: false });
      else await pb.collection('tasks').create(dataToSave, { $autoCancel: false });
      
      toast.success('Task saved');
      setDialogOpen(false);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await pb.collection('tasks').delete(id, { $autoCancel: false });
      toast.success('Task deleted');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleComplete = async (id) => {
    try {
      await pb.collection('tasks').update(id, { status: 'Completed' }, { $autoCancel: false });
      toast.success('Task completed');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'High': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) return <div className="p-8"><Skeleton className="h-[400px] w-full rounded-2xl" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Tasks" 
        description="Manage your to-dos and track progress."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search tasks..."
        primaryActionLabel="New Task"
        onPrimaryAction={() => handleOpenForm()}
        secondaryActions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background rounded-xl"><SelectValue placeholder="Priority" /></SelectTrigger>
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

      <TaskSuggestionsPanel />

      {tasks.length === 0 ? (
        <EmptyState 
          icon={CheckSquare}
          title="No tasks found"
          description="Create a task to get started."
          actionLabel="Create Task"
          onAction={() => handleOpenForm()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'Completed';
            const isDone = task.status === 'Completed';
            
            return (
              <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg shadow-sm border transition-all ${isDone ? 'bg-muted/30 border-border opacity-70' : isOverdue ? 'bg-destructive/5 border-destructive/30' : 'bg-card border-border hover:border-primary/30'}`}>
                <div className="flex-1 min-w-0 pr-4 mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <StatusBadge status={task.status} />
                    {isOverdue && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
                  </div>
                  <h3 className={`text-lg font-semibold ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</h3>
                  {task.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{task.description}</p>}
                  {task.dueDate && (
                    <div className={`flex items-center text-xs mt-2 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.status !== 'Completed' && (
                    <Button variant="outline" size="sm" onClick={() => handleComplete(task.id)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleOpenForm(task)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(task.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? 'Edit Task' : 'New Task'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>Save Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksModule;