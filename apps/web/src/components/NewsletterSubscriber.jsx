import React, { useState } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

const NewsletterSubscriber = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await pb.collection('newsletter_subscribers').create({
        email,
        status: 'Active'
      }, { $autoCancel: false });
      
      toast.success('Thanks for subscribing!');
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      if (error.data?.data?.email?.code === 'validation_not_unique' || error.message.includes('unique')) {
        toast.error('You are already subscribed.');
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-card border border-border rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto ${className}`}>
      <h3 className="text-2xl md:text-3xl font-bold mb-3">Stay Updated</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Join the newsletter to receive the latest insights, project updates, and event announcements directly to your inbox.
      </p>
      
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-xl bg-background"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="h-12 px-6 rounded-xl shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
          {!loading && <Send className="w-4 h-4 ml-2" />}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground mt-4">
        No spam. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default NewsletterSubscriber;