import React, { useState, useEffect, useCallback } from 'react';
import { getFeedbackLogs } from '../../services/loggingService'; // Assuming clearFeedbackLogs will be added
import { FeedbackLogEntry } from '../../types';
// FIX: Corrected import path for icons.
import { TrashIcon } from '../icons';

// Function to clear feedback logs - to be added to loggingService.ts if not present
const clearFeedbackLogs = (): void => {
  try {
    localStorage.removeItem('mccia_msme_feedback_logs'); // Using key from loggingService
    console.log("Feedback logs cleared from localStorage.");
  } catch (error) {
    console.error(`Error clearing feedback logs from localStorage:`, error);
  }
};


const FeedbackLogDisplay: React.FC = () => {
  const [logs, setLogs] = useState<FeedbackLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = useCallback(() => {
    const allLogs = getFeedbackLogs();
    // Sort by timestamp descending (newest first)
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setLogs(allLogs);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all feedback logs? This action cannot be undone.')) {
      clearFeedbackLogs(); // Call the local or imported clear function
      fetchLogs(); // Refresh logs
    }
  };
  
  const filteredLogs = logs.filter(log =>
    log.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">User Feedback Logs</h2>
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="flex items-center py-2 px-4 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            title="Clear all feedback logs"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Clear All Logs
          </button>
        )}
      </div>

       <div className="mb-4">
        <input
          type="text"
          placeholder="Search in queries or responses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-slate-600">
             {logs.length === 0 ? "No feedback logs found." : "No feedback entries match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto max-h-[60vh] relative">
          <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User Query
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Bot Response
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.feedback === '👍' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.feedback}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 break-words max-w-md">
                    {log.query}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 break-words max-w-md">
                    {log.response}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500 mt-4">
        Showing {filteredLogs.length} of {logs.length} total feedback entries. Logs are stored in the browser's local storage.
      </p>
    </div>
  );
};

export default FeedbackLogDisplay;