import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, FolderKanban, AlertCircle } from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, categoryFilter, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const allRecords = await pb.collection('projects').getList(1, 100, { $autoCancel: false });

      let filter = 'publicVisibility=true';
      const filters = [filter];
      
      if (searchTerm) filters.push(`(title ~ "${searchTerm}" || description ~ "${searchTerm}")`);
      if (categoryFilter !== 'all') filters.push(`category = "${categoryFilter}"`);
      if (statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
      
      const records = await pb.collection('projects').getList(1, 50, {
        filter: filters.join(' && '),
        sort: '-createdAt',
        $autoCancel: false,
      });

      setProjects(records.items);

      if (categories.length === 0) {
        const uniqueCategories = [...new Set(allRecords.items.filter(p => p.publicVisibility === true).map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Projects - Roham Carrion</title>
        <meta name="description" content="Explore public projects, initiatives, and ongoing work." />
      </Helmet>

      <Header />

      <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A showcase of ongoing initiatives, completed work, and strategic planning.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-card"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-card">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Idea">Idea</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-[300px] rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-semibold mb-2">Failed to load projects</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchProjects}>Try Again</Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.slug}`} className="apple-card overflow-hidden flex flex-col group">
                {project.featuredImage ? (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img 
                      src={pb.files.getUrl(project, project.featuredImage)} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-secondary flex items-center justify-center">
                    <FolderKanban className="w-10 h-10 text-muted-foreground opacity-20" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground">{project.category || 'Uncategorized'}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      project.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      project.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProjectsPage;