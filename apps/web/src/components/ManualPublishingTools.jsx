import React, { useState } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Copy, ExternalLink, CheckCircle2, Link2 } from 'lucide-react';

const ManualPublishingTools = ({ post, platform, onUpdate }) => {
  const [publishedUrl, setPublishedUrl] = useState(post.externalPlatformLink || '');
  const [publishingNotes, setPublishingNotes] = useState(post.publishingNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Platform caption mapping based on schema
  const captionMap = {
    'linkedin': post.linkedinCaption,
    'facebook': post.facebookCaption,
    'instagram': post.instagramCaption,
    'x': post.xCaption,
    'tiktok': post.tiktokCaption,
    'youtube': post.youtubeCaption
  };

  const caption = captionMap[platform.toLowerCase()] || '';
  const hashtags = post.hashtags || '';
  const fullPost = `${caption}\n\n${hashtags}`.trim();

  const handleCopy = (text, type) => {
    if (!text) {
      toast.error(`No ${type} to copy`);
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${type} to clipboard`);
  };

  const handleMarkPublished = async () => {
    if (!publishedUrl) {
      toast.error('Please provide a published URL first');
      return;
    }
    setIsUpdating(true);
    try {
      const now = new Date().toISOString();
      const updatedPost = await pb.collection('social_posts').update(post.id, {
        status: 'Published',
        publishedAt: now,
        externalPlatformLink: publishedUrl,
        publishingNotes: publishingNotes
      }, { $autoCancel: false });
      toast.success('Marked as published!');
      if (onUpdate) onUpdate(updatedPost);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      const updatedPost = await pb.collection('social_posts').update(post.id, {
        externalPlatformLink: publishedUrl,
        publishingNotes: publishingNotes
      }, { $autoCancel: false });
      toast.success('Notes saved');
      if (onUpdate) onUpdate(updatedPost);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save notes');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <div>
        <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
          Manual Publishing Tools
          {post.status === 'Published' && <CheckCircle2 className="w-4 h-4 text-primary" />}
        </h4>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="secondary" size="sm" onClick={() => handleCopy(caption, 'caption')}>
            <Copy className="w-3.5 h-3.5 mr-2" /> Copy Caption
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleCopy(hashtags, 'hashtags')}>
            <Copy className="w-3.5 h-3.5 mr-2" /> Copy Hashtags
          </Button>
          <Button variant="default" size="sm" onClick={() => handleCopy(fullPost, 'full post')}>
            <Copy className="w-3.5 h-3.5 mr-2" /> Copy Full Post
          </Button>
          {post.externalPlatformLink && (
            <Button variant="outline" size="sm" asChild>
              <a href={post.externalPlatformLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open Link
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <label className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
            <Link2 className="w-3.5 h-3.5" /> Published URL
          </label>
          <Input 
            placeholder="https://..." 
            value={publishedUrl}
            onChange={e => setPublishedUrl(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Publishing Notes</label>
          <Textarea 
            placeholder="Add tags, mentions, or instructions..." 
            value={publishingNotes}
            onChange={e => setPublishingNotes(e.target.value)}
            className="min-h-[80px] text-sm resize-none"
          />
        </div>

        <div className="flex gap-2">
          {post.status !== 'Published' ? (
            <Button onClick={handleMarkPublished} disabled={isUpdating} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Mark as Published
            </Button>
          ) : (
            <Button onClick={handleSaveNotes} disabled={isUpdating} variant="secondary" className="w-full">
              Update Details
            </Button>
          )}
        </div>
      </div>

      {post.publishedAt && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Published on {new Date(post.publishedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default ManualPublishingTools;