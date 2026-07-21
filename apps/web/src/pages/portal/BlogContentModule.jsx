import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Star, FileText, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import BlogForm from '@/components/forms/BlogForm.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import { format } from 'date-fns';

const BlogContentModule = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => { fetchPosts(); }, [searchTerm, statusFilter, featuredFilter]);

  const fetchPosts = async () => {
    try {
      let filter = '';
      const filters = [];
      if (searchTerm) filters.push(`title ~ "${searchTerm}"`);
      if (statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
      if (featuredFilter === 'featured') filters.push('isFeatured = true');
      if (featuredFilter === 'not-featured') filters.push('isFeatured = false');
      if (filters.length > 0) filter = filters.join(' && ');

      const records = await pb.collection('blog_posts').getFullList({ filter, sort: '-created', $autoCancel: false });
      setPosts(records);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load blog posts');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await pb.collection('blog_posts').delete(id, { $autoCancel: false });
      toast.success('Blog post deleted');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete blog post');
    }
  };

  const handleFormSuccess = () => { setDialogOpen(false); setSelectedPost(null); fetchPosts(); };

  if (loading) return <div className="module-container"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;

  return (
    <div className="module-container">
      <ModuleHeader 
        title="Blog & Content" 
        description="Manage your articles, thought leadership, and long-form content."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search articles..."
        primaryActionLabel="New Post"
        onPrimaryAction={() => { setSelectedPost(null); setDialogOpen(true); }}
        secondaryActions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background rounded-xl"><SelectValue placeholder="Featured" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
                <SelectItem value="not-featured">Standard Only</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {posts.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="No articles found"
          description="Start writing your first blog post to share your insights."
          actionLabel="Create Post"
          onAction={() => { setSelectedPost(null); setDialogOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-md transition-all duration-300 border-border overflow-hidden flex flex-col relative">
              {post.isFeatured && (
                <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-border">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
              )}
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <StatusBadge status={post.status} />
                    {post.category && <Badge variant="secondary" className="font-medium px-2.5 py-0.5 bg-muted">{post.category}</Badge>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => { setSelectedPost(post); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(post.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-tight line-clamp-2 mb-2 pr-6">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">{post.excerpt || 'No excerpt provided.'}</p>
                <div className="space-y-3 pt-4 border-t border-border mt-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><User className="w-4 h-4 mr-1.5 opacity-70" /> Author</span>
                    <span className="font-medium truncate max-w-[120px]">{post.author || 'Admin'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><Calendar className="w-4 h-4 mr-1.5 opacity-70" /> Date</span>
                    <span className="font-medium">{post.publishedDate ? format(new Date(post.publishedDate), 'MMM d, yyyy') : post.scheduledDate ? format(new Date(post.scheduledDate), 'MMM d, yyyy') : 'Unscheduled'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedPost ? 'Edit Blog Post' : 'Create Blog Post'}</DialogTitle></DialogHeader>
          <BlogForm post={selectedPost} onSuccess={handleFormSuccess} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogContentModule;