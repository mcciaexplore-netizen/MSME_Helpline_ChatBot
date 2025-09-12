

// FIX: Implementing the QueryLogDisplay component to show user query history.
import React, { useState, useEffect, useCallback } from 'react';
import { getQueryLogs, clearQueryLogs } from '../../services/loggingService';
import { QueryLogEntry } from '../../types';
// FIX: Corrected import path for icons.
import { TrashIcon, EyeIcon } from '../icons';

const QueryLogDisplay: React.FC = () => {
  const [logs, setLogs] = useState<QueryLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<QueryLogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const allLogs = await getQueryLogs();
    setLogs(allLogs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all query logs? This action cannot be undone.')) {
      await clearQueryLogs();
      fetchLogs();
    }
  };

  const filteredLogs = logs.filter(log =>
    log.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-slate-600">Loading query logs...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Query Logs</h2>
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="flex items-center py-2 px-4 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            title="Clear all query logs"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Clear All Logs
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by user, query, or response..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-slate-600">
            {logs.length === 0 ? "No query logs found." : "No logs match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto max-h-[60vh] relative">
          <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Query</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Response Source</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{log.userName} ({log.userId})</td>
                  <td className="px-6 py-4 text-sm text-slate-900 truncate max-w-sm" title={log.query}>{log.query}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.isFaqResult ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800'
                    }`}>
                        {log.isFaqResult ? 'FAQ' : 'AI Model'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => setSelectedLog(log)} className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500 mt-4">
        Showing {filteredLogs.length} of {logs.length} total entries. Logs are stored in Supabase.
      </p>

      {/* Modal for viewing log details */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Log Details</h3>
                    <div className="space-y-4 text-sm">
                        <div><strong>Timestamp:</strong> <span className="font-mono text-slate-700">{new Date(selectedLog.timestamp).toLocaleString()}</span></div>
                        <div><strong>User:</strong> <span className="text-slate-700">{selectedLog.userName} ({selectedLog.userId})</span></div>
                        <div className="p-3 bg-slate-50 rounded-md">
                            <strong className="block mb-1">Query:</strong>
                            <p className="text-slate-800 whitespace-pre-wrap">{selectedLog.query}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-md">
                            <strong className="block mb-1">Response:</strong>
                            <p className="text-slate-800 whitespace-pre-wrap">{selectedLog.response}</p>
                        </div>
                        <div><strong>Source:</strong> <span className="font-semibold">{selectedLog.isFaqResult ? 'FAQ' : 'AI Model'}</span></div>
                        {selectedLog.isFaqResult && selectedLog.relevantFaqs.length > 0 && (
                             <div className="p-3 bg-purple-50 rounded-md">
                                <strong className="block mb-1">Matched FAQs:</strong>
                                <ul className="list-disc list-inside text-slate-700">
                                    {selectedLog.relevantFaqs.map((faq, i) => <li key={i}>{faq.Question}</li>)}
                                </ul>
                            </div>
                        )}
                        {selectedLog.videoSuggestions.length > 0 && (
                            <div className="p-3 bg-green-50 rounded-md">
                                <strong className="block mb-1">Suggested Videos:</strong>
                                <ul className="list-disc list-inside text-slate-700">
                                    {selectedLog.videoSuggestions.map((vid, i) => <li key={i}><a href={vid.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{vid.title}</a></li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 text-right">
                        <button onClick={() => setSelectedLog(null)} className="py-2 px-4 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default QueryLogDisplay;