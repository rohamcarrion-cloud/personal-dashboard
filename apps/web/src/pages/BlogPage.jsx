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
import { Search, BookOpen, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, categoryFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const allRecords = await pb.collection('blog_posts').getList(1, 100, { $autoCancel: false });

      let filter = 'status="Published"';
      const filters = [filter];
      
      if (searchTerm) filters.push(`(title ~ "${searchTerm}" || excerpt ~ "${searchTerm}")`);
      if (categoryFilter !== 'all') filters.push(`category = "${categoryFilter}"`);
      
      const records = await pb.collection('blog_posts').getList(1, 50, {
        filter: filters.join(' && '),
        sort: '-publishedDate',
        $autoCancel: false,
      });

      setPosts(records.items);

      if (categories.length === 0) {
        const uniqueCategories = [...new Set(allRecords.items.filter(p => p.status === 'Published').map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError(err.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const featuredPosts = posts.filter(p => p.isFeatured);
  const regularPosts = posts.filter(p => !p.isFeatured);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Blog - Roham Carrion</title>
        <meta name="description" content="Read the latest thoughts, articles, and insights." />
      </Helmet>

      <Header />

      <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Thoughts, insights, and articles on technology, leadership, and building resilient platforms.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-card"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-card">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-semibold mb-2">Failed to load articles</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchPosts}>Try Again</Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && categoryFilter === 'all' && !searchTerm && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Featured</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredPosts.slice(0, 2).map(post => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="apple-card group overflow-hidden flex flex-col">
                      {post.featuredImage ? (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={pb.files.getUrl(post, post.featuredImage)} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-secondary flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground opacity-20" />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">{post.category || 'Article'}</span>
                          <span className="text-xs text-muted-foreground">
                            {post.publishedDate ? format(new Date(post.publishedDate), 'MMM d, yyyy') : ''}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                        <div className="mt-auto text-sm font-medium text-foreground">By {post.author || 'Roham Carrion'}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts Grid */}
            <div>
              {featuredPosts.length > 0 && categoryFilter === 'all' && !searchTerm && (
                <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(searchTerm || categoryFilter !== 'all' ? posts : regularPosts).map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col">
                    {post.featuredImage ? (
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted mb-4">
                        <img 
                          src={pb.files.getUrl(post, post.featuredImage)} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] w-full rounded-2xl bg-secondary flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-muted-foreground opacity-20" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{post.category || 'Article'}</span>
                      <span className="text-xs text-muted-foreground/60">•</span>
                      <span className="text-xs text-muted-foreground">
                        {post.publishedDate ? format(new Date(post.publishedDate), 'MMM d, yyyy') : ''}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;