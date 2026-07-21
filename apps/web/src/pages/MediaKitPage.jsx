import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ExternalLink, Mail, Phone, ArrowUpRight, Copy } from 'lucide-react';
import { toast } from 'sonner';

const MediaKitPage = () => {
  const [brandKit, setBrandKit] = useState([]);
  const [pressAssets, setPressAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMediaKit();
  }, []);

  const fetchMediaKit = async () => {
    try {
      const [brand, press] = await Promise.all([
        pb.collection('brand_kit').getFullList({ filter: 'isPublic = true', sort: 'order', $autoCancel: false }),
        pb.collection('press_assets').getFullList({ filter: 'isApproved = true && isPublic = true', sort: '-created', $autoCancel: false })
      ]);
      setBrandKit(brand);
      setPressAssets(press);
    } catch (error) {
      toast.error('Failed to load media kit');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <div className="max-w-5xl mx-auto px-4 py-24 space-y-12">
          <Skeleton className="h-24 w-2/3 rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  // Extract specific assets
  const mission = brandKit.find(a => a.section === 'Mission');
  const bios = brandKit.filter(a => a.section === 'Bios');
  const colors = brandKit.filter(a => a.section === 'Colors');
  
  const headshots = pressAssets.filter(a => a.assetType === 'Headshot');
  const logos = pressAssets.filter(a => a.assetType === 'Logo');
  const articles = pressAssets.filter(a => a.assetType === 'Article');
  const pressContact = pressAssets.find(a => a.assetType === 'Other' && (a.pressContactEmail || a.pressContactPhone));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans">
      <Helmet>
        <title>Media Kit | Press Resources</title>
        <meta name="description" content="Official brand assets, headshots, and press resources." />
      </Helmet>

      {/* Hero Section */}
      <section className="py-24 md:py-32 border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6" style={{letterSpacing: '-0.02em'}}>
              Press & Media Kit
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Official resources, approved brand assets, and background information for media professionals and partners.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        
        {/* Mission & Bios */}
        {(mission || bios.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-semibold sticky top-8 text-balance">About the Brand</h2>
            </div>
            <div className="md:col-span-8 space-y-12">
              {mission && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Mission Statement</h3>
                  <p className="text-2xl font-medium leading-snug">"{mission.content}"</p>
                </div>
              )}
              
              {bios.map((bio, i) => (
                <div key={i} className="space-y-4 bg-card p-8 rounded-3xl border border-border shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">{bio.title}</h3>
                    <Button variant="ghost" size="sm" onClick={() => copyText(bio.content, 'Bio')}>
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                  </div>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">{bio.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Logos */}
        {logos.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-semibold sticky top-8 text-balance">Logos & Marks</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">Please do not stretch, alter colors, or modify these logos in any way.</p>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {logos.map(logo => (
                <div key={logo.id} className="group rounded-3xl border border-border bg-muted/30 overflow-hidden flex flex-col">
                  <div className="aspect-video p-8 flex items-center justify-center checkerboard-pattern relative">
                    <img src={logo.assetUrl} alt={logo.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="p-5 bg-card border-t border-border flex items-center justify-between mt-auto">
                    <span className="font-medium">{logo.title}</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={logo.downloadUrl || logo.assetUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Headshots */}
        {headshots.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-semibold sticky top-8 text-balance">Official Headshots</h2>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {headshots.map(photo => (
                <div key={photo.id} className="group rounded-3xl border border-border bg-card overflow-hidden flex flex-col">
                  <div className="aspect-[4/5] bg-muted relative">
                    <img src={photo.assetUrl} alt={photo.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex items-center justify-between mt-auto">
                    <span className="font-medium text-sm">{photo.title}</span>
                    <Button variant="secondary" size="sm" asChild>
                      <a href={photo.downloadUrl || photo.assetUrl} target="_blank" rel="noopener noreferrer">
                        High-Res <Download className="w-3.5 h-3.5 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Colors */}
        {colors.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-semibold sticky top-8 text-balance">Brand Palette</h2>
            </div>
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {colors.map(color => (
                <div key={color.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="h-24 w-full" style={{ backgroundColor: color.colorHex }} />
                  <div className="p-4">
                    <p className="font-medium text-sm truncate">{color.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{color.colorHex}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-semibold sticky top-8 text-balance">Featured Press</h2>
            </div>
            <div className="md:col-span-8 space-y-4">
              {articles.map(article => (
                <a key={article.id} href={article.assetUrl} target="_blank" rel="noopener noreferrer" className="block p-6 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors group">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg pr-4">{article.title}</h3>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                  {article.content && <p className="text-muted-foreground mt-2 text-sm">{article.content}</p>}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Press Contact */}
        {pressContact && (
          <section className="mt-12 p-8 md:p-12 rounded-3xl bg-primary text-primary-foreground">
            <h2 className="text-2xl font-semibold mb-6">Press Inquiries</h2>
            <div className="space-y-4">
              {pressContact.pressContactName && <p className="text-lg">{pressContact.pressContactName}</p>}
              {pressContact.pressContactEmail && (
                <p className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
                  <Mail className="w-5 h-5" /> 
                  <a href={`mailto:${pressContact.pressContactEmail}`}>{pressContact.pressContactEmail}</a>
                </p>
              )}
              {pressContact.pressContactPhone && (
                <p className="flex items-center gap-3 opacity-90">
                  <Phone className="w-5 h-5" /> {pressContact.pressContactPhone}
                </p>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default MediaKitPage;