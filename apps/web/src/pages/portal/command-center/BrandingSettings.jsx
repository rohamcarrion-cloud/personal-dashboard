import React, { useState, useEffect } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Palette, Image as ImageIcon, Globe, FileText, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function BrandingSettings() {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    platformName: '',
    platformTagline: '',
    platformDescription: '',
    primaryDomain: '',
    supportEmail: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#3b82f6',
    footerText: '',
    copyrightText: '',
    defaultOGImage: '',
    publicBrandName: ''
  });

  const [socialLinksStr, setSocialLinksStr] = useState('{}');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      console.log('[BrandingSettings] Fetching platform settings...');
      
      const response = await apiServerClient.fetch('/platform/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      
      setFormData({
        platformName: data.platformName || '',
        platformTagline: data.platformTagline || '',
        platformDescription: data.platformDescription || '',
        primaryDomain: data.primaryDomain || '',
        supportEmail: data.supportEmail || '',
        logoUrl: data.logoUrl || '',
        faviconUrl: data.faviconUrl || '',
        primaryColor: data.primaryColor || '#000000',
        secondaryColor: data.secondaryColor || '#ffffff',
        accentColor: data.accentColor || '#3b82f6',
        footerText: data.footerText || '',
        copyrightText: data.copyrightText || '',
        defaultOGImage: data.defaultOGImage || '',
        publicBrandName: data.publicBrandName || ''
      });
      
      setSocialLinksStr(JSON.stringify(data.socialLinks || {}, null, 2));
      console.log('[BrandingSettings] Settings loaded successfully');
    } catch (error) {
      console.error('[BrandingSettings] Error fetching settings:', error);
      toast.error('Failed to load platform settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('You must be logged in to save settings');
      return;
    }
    
    let parsedSocialLinks = {};
    try {
      parsedSocialLinks = JSON.parse(socialLinksStr);
    } catch (err) {
      toast.error('Invalid JSON format in Social Links');
      return;
    }

    setIsSaving(true);
    console.log('[BrandingSettings] Saving platform settings...');

    // Ensure all 15 fields are explicitly included and fallback to empty string
    const payload = {
      platformName: formData.platformName || '',
      platformTagline: formData.platformTagline || '',
      platformDescription: formData.platformDescription || '',
      primaryDomain: formData.primaryDomain || '',
      supportEmail: formData.supportEmail || '',
      logoUrl: formData.logoUrl || '',
      faviconUrl: formData.faviconUrl || '',
      primaryColor: formData.primaryColor || '#000000',
      secondaryColor: formData.secondaryColor || '#ffffff',
      accentColor: formData.accentColor || '#3b82f6',
      footerText: formData.footerText || '',
      copyrightText: formData.copyrightText || '',
      defaultOGImage: formData.defaultOGImage || '',
      publicBrandName: formData.publicBrandName || '',
      socialLinks: parsedSocialLinks || {}
    };

    try {
      const response = await apiServerClient.fetch('/platform/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Full error response:', result);
        
        // Extract the real error message
        let errorMessage = result.error || result.message || result.data?.error || 'Failed to save settings';
        
        // Append validation details if present
        if (result.details && Array.isArray(result.details) && result.details.length > 0) {
          errorMessage = `${errorMessage}: ${result.details.join(', ')}`;
        }

        throw new Error(errorMessage);
      }

      toast.success('Settings saved successfully');
      console.log('[BrandingSettings] Settings saved successfully');
    } catch (error) {
      console.error('Full error response:', error.response?.data || error.message || error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="module-container">
      <ModuleHeader 
        title="Branding & Platform Settings" 
        description="Configure your platform's global branding, colors, and identity."
      />

      <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
        
        {/* Basic Information */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Basic Information</CardTitle>
            <CardDescription>Core identity details used across the platform and SEO meta tags.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name <span className="text-destructive">*</span></Label>
                <Input id="platformName" name="platformName" value={formData.platformName} onChange={handleChange} placeholder="e.g. Acme Corp Portal" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicBrandName">Public Brand Name</Label>
                <Input id="publicBrandName" name="publicBrandName" value={formData.publicBrandName} onChange={handleChange} placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryDomain">Primary Domain</Label>
                <Input id="primaryDomain" name="primaryDomain" value={formData.primaryDomain} onChange={handleChange} placeholder="https://example.com" type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email <span className="text-destructive">*</span></Label>
                <Input id="supportEmail" name="supportEmail" value={formData.supportEmail} onChange={handleChange} type="email" placeholder="support@example.com" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platformTagline">Tagline</Label>
              <Input id="platformTagline" name="platformTagline" value={formData.platformTagline} onChange={handleChange} placeholder="Brief catchy phrase for meta descriptions" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformDescription">Full Description <span className="text-destructive">*</span></Label>
              <Textarea id="platformDescription" name="platformDescription" value={formData.platformDescription} onChange={handleChange} placeholder="Detailed description of the platform..." rows={4} required />
            </div>
          </CardContent>
        </Card>

        {/* Visual Assets */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Visual Assets</CardTitle>
            <CardDescription>Logos and default imagery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://example.com/logo.png" type="url" />
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-center min-h-[100px]">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo Preview" className="max-h-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <span className="text-sm text-muted-foreground">Logo Preview</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input id="faviconUrl" name="faviconUrl" value={formData.faviconUrl} onChange={handleChange} placeholder="https://example.com/favicon.ico" type="url" />
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-center min-h-[100px]">
                  {formData.faviconUrl ? (
                    <img src={formData.faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <span className="text-sm text-muted-foreground">Favicon Preview</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <Label htmlFor="defaultOGImage">Default Open Graph Image URL</Label>
              <Input id="defaultOGImage" name="defaultOGImage" value={formData.defaultOGImage} onChange={handleChange} placeholder="Used when a page lacks a specific sharing image" type="url" />
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Brand Colors</CardTitle>
            <CardDescription>Select hex codes for dynamic theming across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-3">
                <Label htmlFor="primaryColor">Primary Color <span className="text-destructive">*</span></Label>
                <div className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
                    <input type="color" id="primaryColor" name="primaryColor" value={formData.primaryColor || '#000000'} onChange={handleChange} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                  </div>
                  <Input value={formData.primaryColor || ''} onChange={handleChange} name="primaryColor" className="font-mono uppercase" placeholder="#000000" pattern="^#[0-9A-Fa-f]{6}$" title="Hex color code (e.g. #1a2b3c)" required />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="secondaryColor">Secondary Color <span className="text-destructive">*</span></Label>
                <div className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
                    <input type="color" id="secondaryColor" name="secondaryColor" value={formData.secondaryColor || '#ffffff'} onChange={handleChange} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                  </div>
                  <Input value={formData.secondaryColor || ''} onChange={handleChange} name="secondaryColor" className="font-mono uppercase" placeholder="#ffffff" pattern="^#[0-9A-Fa-f]{6}$" required />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="accentColor">Accent Color <span className="text-destructive">*</span></Label>
                <div className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
                    <input type="color" id="accentColor" name="accentColor" value={formData.accentColor || '#3b82f6'} onChange={handleChange} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                  </div>
                  <Input value={formData.accentColor || ''} onChange={handleChange} name="accentColor" className="font-mono uppercase" placeholder="#3b82f6" pattern="^#[0-9A-Fa-f]{6}$" required />
                </div>
              </div>

            </div>
            
            <div className="mt-8 p-6 rounded-xl border border-border bg-card flex flex-col gap-4">
              <Label className="text-muted-foreground">Color Preview</Label>
              <div className="flex gap-4">
                <div className="flex-1 h-24 rounded-lg shadow-sm flex items-center justify-center text-white font-medium" style={{ backgroundColor: formData.primaryColor }}>Primary</div>
                <div className="flex-1 h-24 rounded-lg shadow-sm flex items-center justify-center text-black font-medium border border-border" style={{ backgroundColor: formData.secondaryColor }}>Secondary</div>
                <div className="flex-1 h-24 rounded-lg shadow-sm flex items-center justify-center text-white font-medium" style={{ backgroundColor: formData.accentColor }}>Accent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer & Social */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Footer & Social</CardTitle>
            <CardDescription>Content displayed in the global site footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text (About)</Label>
                <Textarea id="footerText" name="footerText" value={formData.footerText} onChange={handleChange} placeholder="Short blurb about the company..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyrightText">Copyright Text</Label>
                <Input id="copyrightText" name="copyrightText" value={formData.copyrightText} onChange={handleChange} placeholder="© 2026 Acme Corp. All rights reserved." />
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <Label className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Social Links (JSON)</Label>
              <Textarea 
                id="socialLinks" 
                value={socialLinksStr} 
                onChange={(e) => setSocialLinksStr(e.target.value)} 
                placeholder='{"twitter": "https://x.com/...", "linkedin": "https://linkedin.com/..."}' 
                rows={6} 
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Enter valid JSON format for social media links.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border py-4 flex justify-end">
            <Button type="submit" disabled={isSaving} size="lg" className="px-8">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Branding
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

      </form>
    </div>
  );
}