import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { BrandingProvider, useBranding } from '@/contexts/BrandingContext.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import CommandCenterLayout from '@/components/CommandCenterLayout.jsx';

// Public Pages
import HomePage from '@/pages/HomePage.jsx';
import BlogPage from '@/pages/BlogPage.jsx';
import BlogDetailPage from '@/pages/BlogDetailPage.jsx';
import ProjectsPage from '@/pages/ProjectsPage.jsx';
import ProjectDetailPage from '@/pages/ProjectDetailPage.jsx';
import EventsPage from '@/pages/EventsPage.jsx';
import MediaPage from '@/pages/MediaPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import MediaKitPage from '@/pages/MediaKitPage.jsx';

// Portal Modules
import OverviewDashboard from '@/pages/portal/OverviewDashboard.jsx';
import ProjectsModule from '@/pages/portal/ProjectsModule.jsx';
import BlogContentModule from '@/pages/portal/BlogContentModule.jsx';
import SocialMediaModule from '@/pages/portal/SocialMediaModule.jsx';
import CalendarModule from '@/pages/portal/CalendarModule.jsx';
import EventsModule from '@/pages/portal/EventsModule.jsx';
import ContactsOpportunitiesModule from '@/pages/portal/ContactsOpportunitiesModule.jsx';
import NewsletterModule from '@/pages/portal/NewsletterModule.jsx';
import PressMediaModule from '@/pages/portal/PressMediaModule.jsx';
import MediaLibraryModule from '@/pages/portal/MediaLibraryModule.jsx';
import BrandKitModule from '@/pages/portal/BrandKitModule.jsx';
import PressAssetsModule from '@/pages/portal/PressAssetsModule.jsx';
import AnalyticsModule from '@/pages/portal/AnalyticsModule.jsx';
import SettingsModule from '@/pages/portal/SettingsModule.jsx';
import ContentEngineModule from '@/pages/portal/ContentEngineModule.jsx';
import CampaignsModule from '@/pages/portal/CampaignsModule.jsx';
import CampaignDetailPage from '@/pages/portal/CampaignDetailPage.jsx';
import PublishingQueueModule from '@/pages/portal/PublishingQueueModule.jsx';
import TasksModule from '@/pages/portal/TasksModule.jsx';
import ContentPipelineModule from '@/pages/portal/ContentPipelineModule.jsx';
import CampaignHealthModule from '@/pages/portal/CampaignHealthModule.jsx';
import GrowthOpportunitiesModule from '@/pages/portal/GrowthOpportunitiesModule.jsx';
import AIIntegrationPlan from '@/pages/portal/AIIntegrationPlan.jsx';
import QAChecklist from '@/pages/portal/QAChecklist.jsx';
import AIWorkspace from '@/pages/portal/AIWorkspace.jsx';
import APIManagement from '@/pages/portal/APIManagement.jsx';
import ActivityLogs from '@/pages/portal/ActivityLogs.jsx';
import PublishingMonitor from '@/pages/portal/command-center/PublishingMonitor.jsx';
import SocialIntegrationModule from '@/pages/portal/command-center/SocialIntegrationModule.jsx';
import ConnectedAccountsList from '@/pages/portal/command-center/ConnectedAccountsList.jsx';
import BrandingSettings from '@/pages/portal/command-center/BrandingSettings.jsx';

import { Toaster } from 'sonner';

// Global Helmet Wrapper
const GlobalHead = () => {
  const { branding } = useBranding();
  
  if (!branding) return null;

  const siteName = branding.platformName || 'Platform';
  const desc = branding.platformDescription || branding.platformTagline || '';
  
  return (
    <Helmet defaultTitle={siteName} titleTemplate={`%s - ${siteName}`}>
      <meta name="description" content={desc} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={siteName} />
      <meta property="og:description" content={branding.platformTagline || desc} />
      {branding.defaultOGImage && <meta property="og:image" content={branding.defaultOGImage} />}
    </Helmet>
  );
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrandingProvider>
                  <GlobalHead />
                  <Router>
                      <ScrollToTop />
                      <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={<HomePage />} />
                          <Route path="/blog" element={<BlogPage />} />
                          <Route path="/blog/:slug" element={<BlogDetailPage />} />
                          <Route path="/projects" element={<ProjectsPage />} />
                          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                          <Route path="/events" element={<EventsPage />} />
                          <Route path="/media" element={<MediaPage />} />
                          <Route path="/media-kit" element={<MediaKitPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/portal/login" element={<LoginPage />} />
                          
                          {/* Protected Portal Routes */}
                          <Route path="/portal/command-center" element={
                              <ProtectedRoute>
                                  <CommandCenterLayout />
                              </ProtectedRoute>
                          }>
                              <Route index element={<OverviewDashboard />} />
                              <Route path="overview" element={<OverviewDashboard />} />
                              
                              <Route path="ai-workspace" element={<AIWorkspace />} />
                              
                              <Route path="content-engine" element={<ContentEngineModule />} />
                              <Route path="publishing-queue" element={<PublishingQueueModule />} />
                              <Route path="pipeline" element={<ContentPipelineModule />} />
                              <Route path="campaign-health" element={<CampaignHealthModule />} />
                              <Route path="opportunities" element={<GrowthOpportunitiesModule />} />
                              <Route path="campaigns" element={<CampaignsModule />} />
                              <Route path="campaigns/:id" element={<CampaignDetailPage />} />
                              <Route path="projects" element={<ProjectsModule />} />
                              <Route path="tasks" element={<TasksModule />} />
                              <Route path="blog" element={<BlogContentModule />} />
                              <Route path="social" element={<SocialMediaModule />} />
                              <Route path="social-integration" element={<SocialIntegrationModule />} />
                              <Route path="connected-accounts" element={<ConnectedAccountsList />} />
                              <Route path="calendar" element={<CalendarModule />} />
                              <Route path="events" element={<EventsModule />} />
                              <Route path="contacts" element={<ContactsOpportunitiesModule />} />
                              <Route path="newsletter" element={<NewsletterModule />} />
                              <Route path="press" element={<PressMediaModule />} />
                              <Route path="media-library" element={<MediaLibraryModule />} />
                              <Route path="brand-kit" element={<BrandKitModule />} />
                              <Route path="press-assets" element={<PressAssetsModule />} />
                              <Route path="analytics" element={<AnalyticsModule />} />
                              <Route path="activity-logs" element={<ActivityLogs />} />
                              
                              {/* System & Settings */}
                              <Route path="settings" element={<SettingsModule />} />
                              <Route path="branding" element={<BrandingSettings />} />
                              <Route path="api-management" element={<APIManagement />} />
                              
                              <Route path="qa-checklist" element={<QAChecklist />} />
                              <Route path="ai-integration-plan" element={<AIIntegrationPlan />} />
                              <Route path="publishing-monitor" element={<PublishingMonitor />} />
                          </Route>

                          {/* Catch-all 404 Route */}
                          <Route path="*" element={
                              <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
                                  <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                                  <p className="text-muted-foreground mb-8">The page you are looking for doesn't exist or has been moved.</p>
                                  <a href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                                      Return to Home
                                  </a>
                              </div>
                          } />
                      </Routes>
                  </Router>
                  <Toaster position="top-right" />
                </BrandingProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;