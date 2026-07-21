import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useBranding } from '@/contexts/BrandingContext.jsx';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LayoutDashboard, LogOut, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { branding } = useBranding();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Projects', href: '/projects' },
    { name: 'Events', href: '/events' },
    { name: 'Media', href: '/media' },
    { name: 'Media Kit', href: '/media-kit' },
    { name: 'Contact', href: '/contact' }
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const brandName = branding?.platformName || 'Roham Carrion';
  const customColor = branding?.primaryColor ? { backgroundColor: branding.primaryColor } : {};

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="glass-panel rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3 group">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt={`${brandName} logo`} className="h-8 object-contain transition-transform group-hover:scale-105" />
            ) : (
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105"
                style={customColor.backgroundColor ? customColor : { backgroundColor: 'var(--foreground)', color: 'var(--background)' }}
              >
                {brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-lg hidden sm:block tracking-tight text-foreground">{brandName}</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground relative",
                location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href)) 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              )}
              style={
                (location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))) && branding?.primaryColor 
                  ? { color: branding.primaryColor } 
                  : {}
              }
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <Button asChild className="rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform duration-200" style={customColor}>
              <Link to="/portal/login" style={branding?.primaryColor ? { color: '#ffffff' } : {}}>
                Login <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="secondary" className="rounded-xl">
                <Link to="/portal/command-center">
                  <LayoutDashboard className="mr-2 w-4 h-4" />
                  Portal
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] flex flex-col pt-12">
            <nav className="flex flex-col gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium",
                    location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}
                  style={
                    (location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))) && branding?.primaryColor 
                      ? { color: branding.primaryColor } 
                      : {}
                  }
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pb-8 flex flex-col gap-4">
              {!isAuthenticated ? (
                <Button asChild className="w-full rounded-xl" style={customColor}>
                  <Link to="/portal/login" onClick={() => setIsOpen(false)} style={branding?.primaryColor ? { color: '#ffffff' } : {}}>
                    Login
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="secondary" className="w-full rounded-xl">
                    <Link to="/portal/command-center" onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="mr-2 w-4 h-4" />
                      Command Center
                    </Link>
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <LogOut className="mr-2 w-4 h-4" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;