import React, { useState, useEffect, useCallback } from 'react';
import { getQueryLogs, clearQueryLogs } from '/src/services/loggingService.ts';
import { QueryLogEntry, FAQ, VideoSuggestion } from '/src/types/index.ts';
import { TrashIcon, EyeIcon } from '/src/components/common/Icons.tsx';
import Card from '/src/components/common/Card.tsx';
import Modal from '/src/components/common/Modal.tsx';

// Defensive renderer for a list of FAQs
const FaqList: React.FC<{ faqs: FAQ[] }> = ({ faqs }) => {
    if (!Array.isArray(faqs) || faqs.length === 0) {
        return null;
    }

    const validFaqs = faqs.filter(faq => faq && typeof faq === 'object' && typeof faq.Question === 'string');

    if (validFaqs.length === 0) return null;

    return (
        <div className="p-3 bg-purple-50 rounded-md">
            <strong className="block mb-1 text-slate-800">Matched FAQs:</strong>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
                {validFaqs.map((faq, i) => <li key={i}>{faq.Question}</li>)}
            </ul>
        </div>
    );
};

// Defensive renderer for a list of Videos
const VideoList: React.FC<{ videos: VideoSuggestion[] }> = ({ videos }) => {
    if (!Array.isArray(videos) || videos.length === 0) {
        return null;
    }

    const validVideos = videos.filter(vid => vid && typeof vid === 'object' && typeof vid.title === 'string' && typeof vid.link === 'string');

    if (validVideos.length === 0) return null;
    
    return (
        <div className="p-3 bg-green-50 rounded-md">
            <strong className="block mb-1 text-slate-800">Suggested Videos:</strong>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
                {validVideos.map((vid, i) => (
                    <li key={i}>
                        <a href={vid.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{vid.title}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};


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
      <div className="text-center">
        <p className="text-slate-600">Loading query logs...</p>
      </div>
    );
  }

  return (
    <Card 
        title="Query Logs" 
        noPadding 
        actions={
            logs.length > 0 && (
                <button
                    onClick={handleClearLogs}
                    className="flex items-center justify-center py-2 px-3 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                    title="Clear all query logs"
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
          placeholder="Search by user, query, or response..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-slate-600 text-center py-8">
            {logs.length === 0 ? "No query logs found." : "No logs match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto max-h-[60vh] relative">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Query</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{log.userName}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 truncate max-w-sm" title={log.query}>{log.query}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.isFaqResult ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800'
                    }`}>
                        {log.isFaqResult ? 'FAQ' : 'AI Model'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => setSelectedLog(log)} className="text-blue-600 hover:text-blue-900" title="View Details">
                        <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500 p-4 bg-slate-50 border-t border-slate-200">
        Showing {filteredLogs.length} of {logs.length} total entries.
      </p>

      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)}
        title="Log Details"
        footer={<button onClick={() => setSelectedLog(null)} className="py-2 px-4 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors">Close</button>}
      >
        {selectedLog && (
            <div className="space-y-4 text-sm">
                <div><strong>Timestamp:</strong> <span className="font-mono text-slate-700">{new Date(selectedLog.timestamp).toLocaleString()}</span></div>
                <div><strong>User:</strong> <span className="text-slate-700">{selectedLog.userName} ({selectedLog.userId})</span></div>
                <div className="p-3 bg-slate-50 rounded-md">
                    <strong className="block mb-1 text-slate-800">Query:</strong>
                    <p className="text-slate-800 whitespace-pre-wrap">{selectedLog.query}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-md">
                    <strong className="block mb-1 text-slate-800">Response:</strong>
                    <p className="text-slate-800 whitespace-pre-wrap">{selectedLog.response}</p>
                </div>
                <div><strong>Source:</strong> <span className="font-semibold">{selectedLog.isFaqResult ? 'FAQ' : 'AI Model'}</span></div>
                
                <FaqList faqs={selectedLog.relevantFaqs} />
                <VideoList videos={selectedLog.videoSuggestions} />
            </div>
        )}
      </Modal>
    </Card>
  );
};

export default QueryLogDisplay;
