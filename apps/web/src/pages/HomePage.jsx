import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import NewsletterSubscriber from '@/components/NewsletterSubscriber.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowUpRight, Calendar, BookOpen, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, projectsRes, eventsRes] = await Promise.all([
          pb.collection('blog_posts').getList(1, 3, { filter: 'status="Published"', sort: '-publishedDate', $autoCancel: false }),
          pb.collection('projects').getList(1, 3, { filter: 'publicVisibility=true', sort: '-createdAt', $autoCancel: false }),
          pb.collection('events').getList(1, 3, { filter: 'publicVisibility=true', sort: 'date', $autoCancel: false })
        ]);

        setPosts(postsRes.items);
        setProjects(projectsRes.items);
        setEvents(eventsRes.items);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Helmet>
        <title>Roham Carrion Platform</title>
        <meta name="description" content="Centralized management for projects, media, and professional engagement." />
      </Helmet>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-24 pb-20 md:pt-36 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 border border-border"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Platform v2.0 Live
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight leading-[1.05] mb-6 max-w-4xl"
            >
              Control your brand's digital presence.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            >
              The centralized command center for organizing projects, scheduling content, tracking media relationships, and growing your audience.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button asChild size="lg" className="rounded-xl h-14 px-8 text-base shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                <Link to="/projects">
                  View Public Projects
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl h-14 px-8 text-base bg-background hover:bg-secondary transition-all duration-200">
                <Link to="/portal/login">
                  Enter Command Center
                </Link>
              </Button>
            </motion.div>
          </section>

          {/* Featured Projects */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-3xl font-bold">Featured Projects</h2>
              </div>
              <Link to="/projects" className="hidden sm:flex items-center text-muted-foreground hover:text-foreground font-medium transition-colors">
                View all <ArrowUpRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-[300px] rounded-3xl" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-3xl border border-border">
                <p className="text-muted-foreground">No projects available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((project, idx) => (
                  <Link key={project.id} to={`/projects/${project.slug}`} className={`apple-card p-6 flex flex-col justify-between group ${idx === 0 ? 'md:col-span-2 min-h-[300px]' : 'min-h-[300px]'}`}>
                    <div className="mb-8">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mb-4">
                        {project.status}
                      </span>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-medium text-muted-foreground">{project.category}</span>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Blog & Events Split Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Latest Thoughts */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold">Latest Thoughts</h2>
                  </div>
                  <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                    View all
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                  ) : posts.length === 0 ? (
                    <p className="text-muted-foreground py-4">No blog posts yet.</p>
                  ) : (
                    posts.map((post) => (
                      <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                        <div className="p-5 rounded-2xl border border-transparent hover:border-border hover:bg-card transition-all duration-200">
                          <span className="text-xs font-medium text-muted-foreground mb-2 block">{post.category || 'Uncategorized'}</span>
                          <h4 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{post.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            {post.publishedDate ? format(new Date(post.publishedDate), 'MMMM d, yyyy') : 'Draft'}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming Engagements */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold">Engagements</h2>
                  </div>
                  <Link to="/events" className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                    View all
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                  ) : events.length === 0 ? (
                    <p className="text-muted-foreground py-4">No upcoming events.</p>
                  ) : (
                    events.map((event) => {
                      const eventDate = new Date(event.date);
                      return (
                        <Link key={event.id} to={`/events`} className="flex items-center gap-5 p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-all duration-200 group">
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-secondary text-secondary-foreground shrink-0">
                            <span className="text-xs font-semibold uppercase">{format(eventDate, 'MMM')}</span>
                            <span className="text-xl font-bold">{format(eventDate, 'd')}</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.location || 'Virtual'}</p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* Newsletter Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8">
            <NewsletterSubscriber />
          </section>

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;