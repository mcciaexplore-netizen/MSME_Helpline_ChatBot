import React, { useState, useEffect, useMemo } from 'react';
// FIX: Corrected relative import path.
import { getQueryLogs } from '../services/loggingService';
// FIX: Corrected relative import path.
import { QueryLogEntry } from '../types';
// FIX: Corrected relative import path to constants file.
import { DOMAIN_COLORS } from '../config/constants';

const HANDLED_QUERIES_STORAGE_KEY = 'mccia_handled_queries';

const FaqCreatorModal: React.FC<{ log: QueryLogEntry; onClose: () => void }> = ({ log, onClose }) => {
    const [question, setQuestion] = useState(log.query);
    const [solution, setSolution] = useState(log.response);
    const [keywords, setKeywords] = useState('');
    const [domain, setDomain] = useState('General');
    const [copied, setCopied] = useState(false);

    const handleCopyToClipboard = () => {
        const csvRow = `"${question.replace(/"/g, '""')}","${solution.replace(/"/g, '""')}","${keywords}","${domain}"`;
        navigator.clipboard.writeText(csvRow);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Add to Knowledge Base (FAQ)</h3>
                    <p className="text-sm text-slate-600 mb-4">Review the user's query and the AI's response, then format it as a new FAQ entry. Copy the result as a CSV row and paste it into your Google Sheet.</p>
                    
                    <div className="space-y-4 text-sm">
                        <div className="p-3 bg-slate-50 rounded-md">
                            <label className="block font-medium text-slate-700 mb-1">Original User Query</label>
                            <p className="text-slate-800">{log.query}</p>
                        </div>

                        <div>
                            <label htmlFor="question" className="block font-medium text-slate-700 mb-1">FAQ Question (Editable)</label>
                            <input id="question" value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800" />
                        </div>
                        
                        <div>
                            <label htmlFor="solution" className="block font-medium text-slate-700 mb-1">FAQ Solution (Editable)</label>
                            <textarea id="solution" value={solution} onChange={e => setSolution(e.target.value)} rows={6} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800 resize-vertical" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="keywords" className="block font-medium text-slate-700 mb-1">Keywords (comma-separated)</label>
                                <input id="keywords" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. registration, new business, gst" className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800" />
                            </div>
                            <div>
                                 <label htmlFor="domain" className="block font-medium text-slate-700 mb-1">Domain</label>
                                 <select id="domain" value={domain} onChange={e => setDomain(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-800">
                                    {Object.keys(DOMAIN_COLORS).map(d => <option key={d} value={d}>{d}</option>)}
                                 </select>
                            </div>
                        </div>

                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <button onClick={handleCopyToClipboard} className={`py-2 px-4 rounded-md text-white font-semibold transition-colors ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {copied ? 'Copied to Clipboard!' : 'Copy as CSV Row'}
                        </button>
                        <button onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KnowledgeBaseDashboard: React.FC = () => {
    const [allLogs, setAllLogs] = useState<QueryLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [handledTimestamps, setHandledTimestamps] = useState<string[]>([]);
    const [selectedLog, setSelectedLog] = useState<QueryLogEntry | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            const logs = await getQueryLogs();
            const handled = JSON.parse(localStorage.getItem(HANDLED_QUERIES_STORAGE_KEY) || '[]');
            setAllLogs(logs);
            setHandledTimestamps(handled);
            setIsLoading(false);
        };
        fetchLogs();
    }, []);

    const unreviewedAiQueries = useMemo(() => {
        return allLogs
            .filter(log => !log.isFaqResult && !handledTimestamps.includes(log.timestamp))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allLogs, handledTimestamps]);

    const markAsHandled = (timestamp: string) => {
        const newHandled = [...handledTimestamps, timestamp];
        setHandledTimestamps(newHandled);
        localStorage.setItem(HANDLED_QUERIES_STORAGE_KEY, JSON.stringify(newHandled));
    };

    if (isLoading) {
        return (
             <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="text-slate-600">Loading knowledge base data...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-800">Knowledge Base Optimization</h2>
            <p className="text-sm text-slate-600 mt-1 mb-6">
                Review queries answered by the AI to identify potential new FAQs. Adding them to your Google Sheet will reduce future AI usage and provide faster, standardized answers.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6">
                <h3 className="font-semibold text-blue-800">Action Required</h3>
                <p className="text-sm text-blue-700">There are <span className="font-bold">{unreviewedAiQueries.length}</span> queries pending your review.</p>
            </div>

            <div className="space-y-4">
                {unreviewedAiQueries.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No unreviewed AI-answered queries. Great job!</p>
                ) : (
                    unreviewedAiQueries.map(log => (
                        <div key={log.timestamp} className="border border-slate-200 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 mb-2">{new Date(log.timestamp).toLocaleString()} - by {log.userName}</p>
                            <p className="font-semibold text-slate-800 mb-2">Q: {log.query}</p>
                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md line-clamp-3">A: {log.response}</p>
                            <div className="mt-4 flex gap-4">
                                <button onClick={() => setSelectedLog(log)} className="py-1.5 px-3 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
                                    Review & Create FAQ
                                </button>
                                <button onClick={() => markAsHandled(log.timestamp)} className="py-1.5 px-3 bg-slate-200 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-300">
                                    Mark as Handled
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedLog && <FaqCreatorModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </div>
    );
};

export default KnowledgeBaseDashboard;