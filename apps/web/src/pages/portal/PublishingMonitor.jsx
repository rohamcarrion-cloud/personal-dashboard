import React, { useState, useEffect } from 'react';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import QueueStatusCards from '@/components/PublishingMonitor/QueueStatusCards.jsx';
import PlatformHealth from '@/components/PublishingMonitor/PlatformHealth.jsx';
import PublishingMetrics from '@/components/PublishingMonitor/PublishingMetrics.jsx';
import JobsTable from '@/components/PublishingMonitor/JobsTable.jsx';
import RetryQueue from '@/components/PublishingMonitor/RetryQueue.jsx';
import ActivityLogViewer from '@/components/PublishingMonitor/ActivityLogViewer.jsx';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublishingMonitor() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      setLastRefreshed(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setLastRefreshed(new Date());
  };

  const handleStatusFilterClick = (status) => {
    setStatusFilter(status);
    // Scroll down to JobsTable smoothly
    document.getElementById('jobs-table-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 min-h-[100dvh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <ModuleHeader 
          title="Publishing Monitor" 
          description="Real-time observability into your automated publishing queues and platform connections."
        />
        <div className="flex items-center gap-3 text-sm text-muted-foreground pb-4">
          <span>Last updated: {format(lastRefreshed, 'HH:mm:ss')}</span>
          <button 
            onClick={handleManualRefresh}
            className="p-2 hover:bg-muted rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <QueueStatusCards refreshKey={refreshKey} onFilterClick={handleStatusFilterClick} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <PlatformHealth refreshKey={refreshKey} />
        </motion.div>
        <motion.div className="lg:col-span-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <RetryQueue refreshKey={refreshKey} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="jobs-table-section">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <div className="h-[500px]">
            <JobsTable 
              refreshKey={refreshKey} 
              statusFilter={statusFilter} 
              onStatusFilterChange={setStatusFilter} 
            />
          </div>
        </motion.div>
        <motion.div className="lg:col-span-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <div className="h-[500px]">
            <PublishingMetrics refreshKey={refreshKey} />
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
        <ActivityLogViewer refreshKey={refreshKey} />
      </motion.div>
    </div>
  );
}