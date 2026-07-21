import React from 'react';
import ModuleHeader from '@/components/ModuleHeader.jsx';
import WorkflowHealthDashboard from '@/components/WorkflowHealthDashboard.jsx';
import AlertsPanel from '@/components/AlertsPanel.jsx';
import FollowUpRemindersPanel from '@/components/FollowUpRemindersPanel.jsx';
import AssistantPanel from '@/components/AssistantPanel.jsx';
import TaskSuggestionsPanel from '@/components/TaskSuggestionsPanel.jsx';
import RepurposeRecommendationsPanel from '@/components/RepurposeRecommendationsPanel.jsx';

const OverviewDashboard = () => {
  return (
    <div className="module-container">
      <ModuleHeader 
        title="Overview" 
        description="Dashboard overview and workflow health."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <WorkflowHealthDashboard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AlertsPanel />
            <FollowUpRemindersPanel />
          </div>
          <TaskSuggestionsPanel />
          <RepurposeRecommendationsPanel />
        </div>
        <div className="xl:col-span-1">
          <div className="sticky top-8">
            <AssistantPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;