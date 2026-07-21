import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, Image as ImageIcon, ExternalLink, AlertCircle, FileText, Video } from 'lucide-react';

const MediaPage = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedia();
  }, [searchTerm]);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      let filter = '';
      const filters = [];
      
      if (searchTerm) filters.push(`(title ~ "${searchTerm}" || category ~ "${searchTerm}")`);
      
      if (filters.length > 0) {
        filter = filters.join(' && ');
      }
      
      const records = await pb.collection('media_library').getList(1, 50, {
        filter,
        sort: '-created',
        $autoCancel: false,
      });

      setMedia(records.items);
    } catch (err) {
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />;
    const type = fileType.toLowerCase();
    if (type.includes('video')) return <Video className="w-8 h-8 text-muted-foreground opacity-50" />;
    if (type.includes('pdf') || type.includes('doc')) return <FileText className="w-8 h-8 text-muted-foreground opacity-50" />;
    return <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Media Library - Roham Carrion</title>
        <meta name="description" content="Public media assets, images, and resources." />
      </Helmet>

      <Header />

      <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Media Library</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Public media assets, images, and downloadable resources.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-card"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="aspect-square rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-semibold mb-2">Failed to load media</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchMedia}>Try Again</Button>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No media items found</h3>
            <p className="text-muted-foreground">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {media.map((item) => {
              const fileUrl = item.fileUrl ? pb.files.getUrl(item, item.fileUrl) : null;
              const isImage = item.fileType?.toLowerCase().includes('image') || (!item.fileType && fileUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i));
              
              return (
                <a 
                  key={item.id} 
                  href={fileUrl || '#'} 
                  target={fileUrl ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="apple-card overflow-hidden flex flex-col group"
                >
                  <div className="aspect-square w-full bg-muted flex items-center justify-center relative overflow-hidden">
                    {fileUrl && isImage ? (
                      <img 
                        src={fileUrl} 
                        alt={item.altText || item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      getFileIcon(item.fileType)
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                        {item.category || 'Asset'}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {item.fileType || 'FILE'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MediaPage;