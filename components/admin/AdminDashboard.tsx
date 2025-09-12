
import React, { useState } from 'react';
import QueryLogDisplay from './QueryLogDisplay';
import FeedbackLogDisplay from './FeedbackLogDisplay';
import TrendsDisplay from './TrendsDisplay';
import KnowledgeBaseDashboard from './KnowledgeBaseDashboard';

type AdminTab = 'trends' | 'queries' | 'feedback' | 'knowledgeBase';

const TabButton: React.FC<{ tab: AdminTab; label: string; activeTab: AdminTab; setActiveTab: (tab: AdminTab) => void; }> = ({ tab, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        {label}
    </button>
);

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('trends');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'trends':
        return <TrendsDisplay />;
      case 'queries':
        return <QueryLogDisplay />;
      case 'feedback':
        return <FeedbackLogDisplay />;
      case 'knowledgeBase':
        return <KnowledgeBaseDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-100 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Review user interactions and bot performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-300 mb-6 pb-2">
            <TabButton tab="trends" label="Trends & Analytics" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton tab="knowledgeBase" label="Knowledge Base" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton tab="queries" label="Query Logs" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton tab="feedback" label="Feedback Logs" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
