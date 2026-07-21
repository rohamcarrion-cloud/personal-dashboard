import React, { useState, useEffect } from 'react';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import ActivityLogsViewer from '@/components/ActivityLogs/ActivityLogsViewer.jsx';
import { Card } from '@/components/ui/card';

export default function ActivityLogs() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <ModuleHeader 
        title="Activity Logs" 
        description="View all system activities, publishing events, and automated actions in real-time."
      />
      <Card className="p-0 overflow-hidden border-border shadow-sm">
        <ActivityLogsViewer />
      </Card>
    </div>
  );
}