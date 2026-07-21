import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Breadcrumbs from '@/components/Breadcrumbs.jsx';
import NewsletterSubscriber from '@/components/NewsletterSubscriber.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderKanban, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const record = await pb.collection('projects').getFirstListItem(`slug="${slug}" && publicVisibility=true`, {
          $autoCancel: false
        });
        setProject(record);

        if (record.category) {
          const related = await pb.collection('projects').getList(1, 3, {
            filter: `category="${record.category}" && id!="${record.id}" && publicVisibility=true`,
            sort: '-createdAt',
            $autoCancel: false
          });
          setRelatedProjects(related.items);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        navigate('/404', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <Skeleton className="h-8 w-1/3 mb-8" />
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          <Skeleton className="h-[400px] w-full rounded-3xl mb-8" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{`${project.title} - Projects | Roham Carrion`}</title>
        <meta name="description" content={project.description} />
      </Helmet>

      <Header />

      <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <Breadcrumbs items={[
          { label: 'Projects', href: '/projects' },
          { label: project.title }
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              {project.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {project.description}
            </p>

            {project.featuredImage && (
              <div className="aspect-video w-full rounded-3xl overflow-hidden mb-12 bg-muted">
                <img 
                  src={pb.files.getUrl(project, project.featuredImage)} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {project.notes && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-12" dangerouslySetInnerHTML={{ __html: project.notes }} />
            )}
          </div>

          <div className="space-y-8">
            <div className="apple-card p-6">
              <h3 className="font-semibold mb-4 text-lg">Project Details</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground mb-1">Status</dt>
                  <dd>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${
                      project.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      project.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {project.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">Category</dt>
                  <dd className="font-medium">{project.category || 'Uncategorized'}</dd>
                </div>
                {project.timeline && (
                  <div>
                    <dt className="text-muted-foreground mb-1">Timeline</dt>
                    <dd className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {project.timeline}
                    </dd>
                  </div>
                )}
                {project.relatedUrl && (
                  <div className="pt-4">
                    <a href={project.relatedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline font-medium">
                      Visit Project <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
              </dl>
            </div>

            {project.tasks && (
              <div className="apple-card p-6">
                <h3 className="font-semibold mb-4 text-lg">Key Objectives</h3>
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: project.tasks }} />
              </div>
            )}
          </div>
        </div>

        <hr className="border-border my-16" />

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mb-20">
            <h3 className="text-2xl font-bold mb-8">Similar Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map(related => (
                <Link key={related.id} to={`/projects/${related.slug}`} className="apple-card p-5 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">{related.category}</span>
                    <FolderKanban className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors mb-2">{related.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{related.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <NewsletterSubscriber className="bg-secondary/50 border-none" />

      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetailPage;