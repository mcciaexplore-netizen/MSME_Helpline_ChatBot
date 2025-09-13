import React, { useState, useEffect, useMemo } from 'react';
import { getQueryLogs } from '../../services/loggingService';
import { QueryLogEntry } from '../../types';
import { DOMAIN_COLORS } from '../../config/constants';
import Card from '../common/Card';
import Modal from '../common/Modal';
// FIX: Imported the missing DocumentTextIcon component.
import { DocumentTextIcon } from '../common/Icons';

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
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Add to Knowledge Base (FAQ)"
            footer={
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                    <button onClick={handleCopyToClipboard} className={`py-2 px-4 rounded-md text-white font-semibold transition-colors w-full sm:w-auto ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {copied ? 'Copied to Clipboard!' : 'Copy as CSV Row'}
                    </button>
                    <button onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors w-full sm:w-auto">Close</button>
                </div>
            }
        >
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
        </Modal>
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
        if (window.confirm("Are you sure you want to mark this as handled? It will be hidden from this list.")) {
            const newHandled = [...handledTimestamps, timestamp];
            setHandledTimestamps(newHandled);
            localStorage.setItem(HANDLED_QUERIES_STORAGE_KEY, JSON.stringify(newHandled));
        }
    };
    
    const resetHandled = () => {
         if (window.confirm("This will show all handled items again. Are you sure?")) {
            setHandledTimestamps([]);
            localStorage.removeItem(HANDLED_QUERIES_STORAGE_KEY);
        }
    }

    if (isLoading) {
        return (
             <div className="text-center">
                <p className="text-slate-600">Loading knowledge base data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">Knowledge Base Optimization</h2>
            <p className="text-sm text-slate-600">
                Review queries answered by the AI to identify potential new FAQs. Adding them to your Google Sheet will reduce future AI usage and provide faster, standardized answers.
            </p>

            <Card className="bg-blue-50 border-blue-200 border">
                 <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="bg-blue-200 text-blue-700 rounded-full h-10 w-10 flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="font-semibold text-blue-800">Action Required</h3>
                        <p className="text-sm text-blue-700">There are <span className="font-bold">{unreviewedAiQueries.length}</span> queries pending your review.</p>
                    </div>
                 </div>
            </Card>

            <Card title={`Unreviewed AI Queries (${unreviewedAiQueries.length})`}>
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                    {unreviewedAiQueries.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-600">No unreviewed AI-answered queries. Great job!</p>
                            {handledTimestamps.length > 0 && (
                                <button onClick={resetHandled} className="mt-4 text-sm text-blue-600 hover:underline">
                                    Reset handled items
                                </button>
                            )}
                        </div>
                    ) : (
                        unreviewedAiQueries.map(log => (
                            <div key={log.timestamp} className="border border-slate-200 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                                <p className="text-sm text-slate-500 mb-2">{new Date(log.timestamp).toLocaleString()} - by {log.userName}</p>
                                <p className="font-semibold text-slate-800 mb-2">Q: {log.query}</p>
                                <p className="text-sm text-slate-700 bg-slate-100 p-3 rounded-md line-clamp-3">A: {log.response}</p>
                                <div className="mt-4 flex flex-wrap gap-4">
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
            </Card>

            {selectedLog && <FaqCreatorModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </div>
    );
};

export default KnowledgeBaseDashboard;