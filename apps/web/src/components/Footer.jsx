import React from 'react';
import { Link } from 'react-router-dom';
import { useBranding } from '@/contexts/BrandingContext.jsx';
import { Twitter, Linkedin, Github, Mail, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  const { branding } = useBranding();
  const currentYear = new Date().getFullYear();

  const brandName = branding?.platformName || 'Roham Carrion';
  const aboutText = branding?.footerText || 'A comprehensive command center and platform for managing professional brand, projects, media, and community engagement.';
  const copyText = branding?.copyrightText || `© ${currentYear} ${brandName}. All rights reserved.`;

  const socialIconClass = "w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-foreground hover:text-background transition-colors duration-200";

  return (
    <footer className="mt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8">
      <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row justify-between gap-12">
        
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            {branding?.logoUrl ? (
               <img src={branding.logoUrl} alt={`${brandName} logo`} className="h-8 object-contain" />
            ) : (
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-background font-bold"
                style={branding?.primaryColor ? { backgroundColor: branding.primaryColor } : { backgroundColor: 'var(--foreground)' }}
              >
                {brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-lg text-foreground tracking-tight">{brandName}</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            {aboutText}
          </p>
          <div className="flex gap-4 flex-wrap">
            {branding?.socialLinks?.twitter && (
               <a href={branding.socialLinks.twitter} target="_blank" rel="noreferrer" className={socialIconClass}>
                 <Twitter className="w-4 h-4" />
               </a>
            )}
            {branding?.socialLinks?.linkedin && (
               <a href={branding.socialLinks.linkedin} target="_blank" rel="noreferrer" className={socialIconClass}>
                 <Linkedin className="w-4 h-4" />
               </a>
            )}
            {branding?.socialLinks?.facebook && (
               <a href={branding.socialLinks.facebook} target="_blank" rel="noreferrer" className={socialIconClass}>
                 <Facebook className="w-4 h-4" />
               </a>
            )}
            {branding?.socialLinks?.instagram && (
               <a href={branding.socialLinks.instagram} target="_blank" rel="noreferrer" className={socialIconClass}>
                 <Instagram className="w-4 h-4" />
               </a>
            )}
            {!branding?.socialLinks?.twitter && !branding?.socialLinks?.linkedin && (
              // Fallbacks if nothing is set
              <>
                <a href="#" className={socialIconClass}><Twitter className="w-4 h-4" /></a>
                <a href="#" className={socialIconClass}><Linkedin className="w-4 h-4" /></a>
              </>
            )}
            <Link to="/contact" className={socialIconClass}>
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="flex gap-12 sm:gap-16 flex-wrap">
          <div className="flex flex-col gap-4">
            <span className="font-semibold text-foreground text-sm">Platform</span>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            <Link to="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Events</Link>
            <Link to="/media" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Media</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-semibold text-foreground text-sm">Connect</span>
            <Link to="/media-kit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Media Kit</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link to="/portal/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Portal Login</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-semibold text-foreground text-sm">Legal</span>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground px-4">
        <p>{copyText}</p>
        <p className="mt-2 sm:mt-0">Powered by Builder</p>
      </div>
    </footer>
  );
};

export default Footer;