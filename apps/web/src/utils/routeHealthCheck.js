export const checkRouteHealth = async () => {
  const routes = [
    '/', '/blog', '/projects', '/events', '/media', '/media-kit', '/contact', 
    '/portal/login', '/portal/command-center', '/portal/command-center/content-engine', 
    '/portal/command-center/publishing-queue', '/portal/command-center/pipeline', 
    '/portal/command-center/blog', '/portal/command-center/social', 
    '/portal/command-center/newsletter', '/portal/command-center/press', 
    '/portal/command-center/calendar', '/portal/command-center/campaigns', 
    '/portal/command-center/campaign-health', '/portal/command-center/projects', 
    '/portal/command-center/events', '/portal/command-center/tasks', 
    '/portal/command-center/contacts', '/portal/command-center/opportunities', 
    '/portal/command-center/media-library', '/portal/command-center/brand-kit', 
    '/portal/command-center/press-assets', '/portal/command-center/analytics', 
    '/portal/command-center/settings', '/portal/ai-integration-plan'
  ];

  const results = [];

  for (const route of routes) {
    const start = performance.now();
    try {
      // In a SPA, this will typically fetch index.html and return 200 if the server is up.
      // It serves as a basic ping/availability check for the path.
      const res = await fetch(route, { method: 'HEAD', cache: 'no-cache' });
      const loadTime = Math.round(performance.now() - start);
      
      results.push({
        route,
        status: res.ok ? 'ok' : 'error',
        loadTime,
        error: res.ok ? null : `HTTP ${res.status} ${res.statusText}`
      });
    } catch (err) {
      const loadTime = Math.round(performance.now() - start);
      results.push({
        route,
        status: 'error',
        loadTime,
        error: err.message || 'Network error'
      });
    }
  }

  return results;
};