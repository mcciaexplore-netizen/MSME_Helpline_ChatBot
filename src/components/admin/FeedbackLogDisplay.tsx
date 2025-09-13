import React, { useState, useEffect, useCallback } from 'react';
import { getFeedbackLogs, clearFeedbackLogs } from '../../services/loggingService';
import { FeedbackLogEntry } from '../../types';
import { TrashIcon } from '../common/Icons';
import Card from '../common/Card';

const FeedbackLogDisplay: React.FC = () => {
  const [logs, setLogs] = useState<FeedbackLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const allLogs = await getFeedbackLogs();
    setLogs(allLogs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all feedback logs? This action cannot be undone.')) {
      await clearFeedbackLogs();
      fetchLogs(); 
    }
  };
  
  const filteredLogs = logs.filter(log =>
    log.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.response.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-slate-600">Loading feedback logs...</p>
      </div>
    );
  }

  return (
    <Card 
        title="User Feedback Logs" 
        noPadding
        actions={
            logs.length > 0 && (
                <button
                    onClick={handleClearLogs}
                    className="flex items-center justify-center py-2 px-3 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                    title="Clear all feedback logs"
                >
                    <TrashIcon className="w-4 h-4 mr-1.5" />
                    Clear All
                </button>
            )
        }
    >
       <div className="p-4 sm:p-6 border-b border-slate-200">
        <input
          type="text"
          placeholder="Search in queries or responses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-slate-600 text-center py-8">
             {logs.length === 0 ? "No feedback logs found." : "No feedback entries match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto max-h-[60vh] relative">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Feedback</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User Query</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bot Response</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-2xl text-center">
                    {log.feedback}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-md" title={log.query}>{log.query}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-md" title={log.response}>{log.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500 p-4 bg-slate-50 border-t border-slate-200">
        Showing {filteredLogs.length} of {logs.length} total feedback entries.
      </p>
    </Card>
  );
};

export default FeedbackLogDisplay;