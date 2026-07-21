import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Settings,
  Menu,
  LogOut,
  FolderKanban,
  CheckSquare,
  Share2,
  Image as ImageIcon,
  BarChart3,
  Megaphone,
  Mail,
  Newspaper,
  HeartPulse,
  TrendingUp,
  Link2,
  Sparkles,
  Bot,
  ActivitySquare,
  MonitorPlay,
  Palette,
  Zap,
  Send,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils.js';

const CommandCenterLayout = () => {
  const { logout, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Overview', href: '/portal/command-center/overview', icon: LayoutDashboard },
    { 
      name: 'Strategy & Planning', 
      items: [
        { name: 'Campaigns', href: '/portal/command-center/campaigns', icon: Megaphone },
        { name: 'Projects', href: '/portal/command-center/projects', icon: FolderKanban },
        { name: 'Tasks', href: '/portal/command-center/tasks', icon: CheckSquare },
        { name: 'Calendar', href: '/portal/command-center/calendar', icon: Calendar },
      ]
    },
    {
      name: 'Content & Publishing',
      items: [
        { name: 'Content Engine', href: '/portal/command-center/content-engine', icon: Zap },
        { name: 'Content Pipeline', href: '/portal/command-center/pipeline', icon: FileText },
        { name: 'Publishing Queue', href: '/portal/command-center/publishing-queue', icon: Send },
        { name: 'Publishing Monitor', href: '/portal/command-center/publishing-monitor', icon: MonitorPlay },
      ]
    },
    {
      name: 'Channels & Media',
      items: [
        { name: 'Blog Content', href: '/portal/command-center/blog', icon: FileText },
        { name: 'Social Media', href: '/portal/command-center/social', icon: Share2 },
        { name: 'Newsletter', href: '/portal/command-center/newsletter', icon: Mail },
        { name: 'Press & Media', href: '/portal/command-center/press', icon: Newspaper },
      ]
    },
    {
      name: 'Assets & Resources',
      items: [
        { name: 'Media Library', href: '/portal/command-center/media-library', icon: ImageIcon },
        { name: 'Brand Kit', href: '/portal/command-center/brand-kit', icon: Sparkles },
        { name: 'Press Assets', href: '/portal/command-center/press-assets', icon: FileText },
      ]
    },
    {
      name: 'Relationships & Growth',
      items: [
        { name: 'Contacts & Opps', href: '/portal/command-center/contacts', icon: Users },
        { name: 'Events', href: '/portal/command-center/events', icon: Calendar },
        { name: 'Analytics', href: '/portal/command-center/analytics', icon: BarChart3 },
        { name: 'Growth Opps', href: '/portal/command-center/opportunities', icon: TrendingUp },
        { name: 'Campaign Health', href: '/portal/command-center/campaign-health', icon: HeartPulse },
      ]
    },
    {
      name: 'Intelligence & Ops',
      items: [
        { name: 'AI Workspace', href: '/portal/command-center/ai-workspace', icon: Bot },
        { name: 'Social Integration', href: '/portal/command-center/social-integration', icon: Link2 },
        { name: 'Connected Accounts', href: '/portal/command-center/connected-accounts', icon: Users },
        { name: 'API Management', href: '/portal/command-center/api-management', icon: Settings },
        { name: 'Activity Logs', href: '/portal/command-center/activity-logs', icon: ActivitySquare },
      ]
    },
    {
      name: 'System',
      items: [
        { name: 'Branding', href: '/portal/command-center/branding', icon: Palette },
        { name: 'Settings', href: '/portal/command-center/settings', icon: Settings },
      ]
    }
  ];

  const SidebarContent = () => {
    // Extract the icon component to a capitalized variable to use as a valid JSX tag
    const OverviewIcon = navigation[0].icon;

    return (
      <div className="flex flex-col h-full bg-card border-r border-border">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
              CC
            </div>
            <span className="font-bold text-lg tracking-tight">Command Center</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 scrollbar-thin">
          {/* Main Overview Link */}
          <div className="space-y-1">
            <Link
              to={navigation[0].href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                location.pathname === navigation[0].href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <OverviewIcon className="w-4 h-4" />
              {navigation[0].name}
            </Link>
          </div>

          {/* Grouped Links */}
          {navigation.slice(1).map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.name}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      location.pathname.startsWith(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium text-xs">
              {currentUser?.email?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{currentUser?.name || 'Admin User'}</span>
              <span className="text-xs text-muted-foreground truncate">{currentUser?.email}</span>
            </div>
          </div>
          <div className="space-y-2">
            <a
              href="https://rohamcarrion.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-start gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              <Globe className="w-4 h-4" />
              Return to Site
            </a>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
              CC
            </div>
            <span className="font-bold text-lg">Command Center</span>
          </Link>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommandCenterLayout;