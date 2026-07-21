import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Share2, Mail, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import RepurposeRecommendationsPanel from '@/components/RepurposeRecommendationsPanel.jsx';

const ContentPipelineModule = () => {
  const [content, setContent] = useState({
    Draft: [], Scheduled: [], Published: [], Failed: [], Archived: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const [blog, social, newsletter, press] = await Promise.all([
          pb.collection('blog_posts').getFullList({ sort: '-created', $autoCancel: false }),
          pb.collection('social_posts').getFullList({ sort: '-created', $autoCancel: false }),
          pb.collection('newsletter_campaigns').getFullList({ sort: '-created', $autoCancel: false }),
          pb.collection('press_media').getFullList({ sort: '-created', $autoCancel: false })
        ]);

        const allContent = [
          ...blog.map(i => ({ ...i, _type: 'Blog', _icon: FileText, _color: 'text-orange-500' })),
          ...social.map(i => ({ ...i, _type: 'Social', _icon: Share2, _color: 'text-blue-500' })),
          ...newsletter.map(i => ({ ...i, _type: 'Newsletter', _icon: Mail, _color: 'text-green-500' })),
          ...press.map(i => ({ ...i, _type: 'Press', _icon: Newspaper, _color: 'text-purple-500' }))
        ];

        const grouped = {
          Draft: allContent.filter(i => i.status === 'Draft' || i.pitchStatus === 'Drafted'),
          Scheduled: allContent.filter(i => i.status === 'Scheduled'),
          Published: allContent.filter(i => i.status === 'Published' || i.status === 'Sent' || i.pitchStatus === 'Published'),
          Failed: allContent.filter(i => i.status === 'Failed'),
          Archived: allContent.filter(i => i.status === 'Archived')
        };

        setContent(grouped);
      } catch (error) {
        console.error("Error fetching pipeline:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPipeline();
  }, []);

  if (loading) return <div className="module-container"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;

  const columns = ['Draft', 'Scheduled', 'Published', 'Failed'];

  return (
    <div className="module-container max-w-[1600px]">
      <ModuleHeader 
        title="Content Pipeline" 
        description="Track content through creation, review, and publishing stages."
      />

      <RepurposeRecommendationsPanel />

      <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
        {columns.map(col => (
          <div key={col} className="flex-1 min-w-[300px] max-w-[400px] bg-muted/30 rounded-2xl p-4 border border-border snap-start flex flex-col h-[75vh]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-foreground">{col}</h3>
              <Badge variant="secondary">{content[col].length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {content[col].map(item => {
                const Icon = item._icon;
                return (
                  <div key={`${item._type}-${item.id}`} className="bg-card p-4 rounded-xl border border-border shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${item._color}`} />
                      <span className="text-xs font-medium text-muted-foreground">{item._type}</span>
                      {item.platforms && <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{item.platforms}</span>}
                    </div>
                    <p className="text-sm font-medium leading-snug mb-2 line-clamp-2">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.created), 'MMM d, yyyy')}
                    </p>
                  </div>
                );
              })}
              {content[col].length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentPipelineModule;