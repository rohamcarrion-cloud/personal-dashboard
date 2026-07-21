import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Breadcrumbs from '@/components/Breadcrumbs.jsx';
import NewsletterSubscriber from '@/components/NewsletterSubscriber.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const record = await pb.collection('blog_posts').getFirstListItem(`slug="${slug}" && status="Published"`, {
          $autoCancel: false
        });
        setPost(record);

        if (record.category) {
          const related = await pb.collection('blog_posts').getList(1, 3, {
            filter: `category="${record.category}" && id!="${record.id}" && status="Published"`,
            sort: '-publishedDate',
            $autoCancel: false
          });
          setRelatedPosts(related.items);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        navigate('/404', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
          <Skeleton className="h-8 w-1/3 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-2/3 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{`${post.seoTitle || post.title} - Roham Carrion`}</title>
        <meta name="description" content={post.seoDescription || post.excerpt} />
      </Helmet>

      <Header />

      <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <Breadcrumbs items={[
          { label: 'Blog', href: '/blog' },
          { label: post.title }
        ]} />

        <article className="mb-20">
          <header className="mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {post.category || 'Article'}
              </span>
              <span className="text-sm text-muted-foreground">
                {post.publishedDate ? format(new Date(post.publishedDate), 'MMMM d, yyyy') : ''}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              By {post.author || 'Roham Carrion'}
            </p>
          </header>

          {post.featuredImage && (
            <div className="aspect-video w-full rounded-3xl overflow-hidden mb-12 bg-muted">
              <img 
                src={pb.files.getUrl(post, post.featuredImage)} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <hr className="border-border mb-16" />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-20">
            <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(related => (
                <Link key={related.id} to={`/blog/${related.slug}`} className="group">
                  {related.featuredImage ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted mb-4">
                      <img 
                        src={pb.files.getUrl(related, related.featuredImage)} 
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-xl bg-secondary mb-4" />
                  )}
                  <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{related.title}</h4>
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

export default BlogDetailPage;