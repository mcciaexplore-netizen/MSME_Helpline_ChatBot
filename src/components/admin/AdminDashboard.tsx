import React, { useState } from 'react';
import QueryLogDisplay from './QueryLogDisplay';
import FeedbackLogDisplay from './FeedbackLogDisplay';
import TrendsDisplay from './TrendsDisplay';
import KnowledgeBaseDashboard from './KnowledgeBaseDashboard';
import { ChartBarIcon, BookOpenIcon, ChatBubbleLeftRightIcon } from '../common/Icons';

type AdminTab = 'trends' | 'knowledgeBase' | 'queries' | 'feedback';

interface TabButtonProps {
    tab: AdminTab;
    label: string;
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, label, activeTab, setActiveTab, icon }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        {icon}
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
    <div className="flex-1 bg-slate-100 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Review user interactions, analyze trends, and optimize the knowledge base.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-300 mb-6 pb-3">
            <TabButton tab="trends" label="Trends & Analytics" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ChartBarIcon className="w-5 h-5" />} />
            <TabButton tab="knowledgeBase" label="Knowledge Base" activeTab={activeTab} setActiveTab={setActiveTab} icon={<BookOpenIcon className="w-5 h-5" />} />
            <TabButton tab="queries" label="Query Logs" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />} />
            <TabButton tab="feedback" label="Feedback Logs" activeTab={activeTab} setActiveTab={setActiveTab} icon={<span className="text-lg">👍</span>} />
        </div>

        <div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
