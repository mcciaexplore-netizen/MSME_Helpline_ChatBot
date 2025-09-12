

// FIX: Implementing the TrendsDisplay component for query analytics.
import React, { useState, useEffect, useMemo } from 'react';
import { getQueryLogs } from '../../services/loggingService';
// FIX: Corrected import path for constants.
import { STOP_WORDS } from '../../constants';
import { QueryLogEntry } from '../../types';

// A simple word counter, could be replaced with a more advanced library
const countWordFrequency = (texts: string[]): Map<string, number> => {
  const frequency = new Map<string, number>();
  texts.forEach(text => {
    // Match words (3+ letters), convert to lowercase, and filter stop words
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    words.forEach(word => {
      if (!STOP_WORDS.has(word)) {
        frequency.set(word, (frequency.get(word) || 0) + 1);
      }
    });
  });
  return frequency;
};

const TrendsDisplay: React.FC = () => {
  const [queryCount, setQueryCount] = useState(0);
  const [faqHitCount, setFaqHitCount] = useState(0);
  const [topKeywords, setTopKeywords] = useState<[string, number][]>([]);
  const [allLogs, setAllLogs] = useState<QueryLogEntry[]>([]);

  useEffect(() => {
    const logs = getQueryLogs();
    setAllLogs(logs);
    setQueryCount(logs.length);
    setFaqHitCount(logs.filter(log => log.isFaqResult).length);

    if (logs.length > 0) {
      const allQueries = logs.map(log => log.query);
      const wordFreq = countWordFrequency(allQueries);
      const sortedKeywords = [...wordFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Top 15 keywords
      setTopKeywords(sortedKeywords);
    }
  }, []);

  const faqHitRate = useMemo(() => {
    if (queryCount === 0) return '0.00';
    return ((faqHitCount / queryCount) * 100).toFixed(2);
  }, [queryCount, faqHitCount]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Query Trends & Analytics</h2>

      {queryCount === 0 ? (
         <p className="text-slate-600">No query data available to generate trends.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Cards */}
          <div className="bg-slate-50 p-5 rounded-lg text-center">
            <p className="text-sm font-medium text-slate-500">Total Queries</p>
            <p className="text-4xl font-bold text-slate-800 mt-1">{queryCount}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-lg text-center">
            <p className="text-sm font-medium text-slate-500">FAQ Hits</p>
            <p className="text-4xl font-bold text-slate-800 mt-1">{faqHitCount}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-lg text-center">
            <p className="text-sm font-medium text-slate-500">FAQ Hit Rate</p>
            <p className="text-4xl font-bold text-slate-800 mt-1">{faqHitRate}%</p>
          </div>
          
          {/* Top Keywords */}
          <div className="md:col-span-3 bg-slate-50 p-5 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Top Keywords</h3>
            {topKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                {topKeywords.map(([word, count]) => (
                    <div key={word} className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5">
                    <span className="text-sm font-medium text-slate-700">{word}</span>
                    <span className="ml-2 text-xs font-semibold text-white bg-blue-500 rounded-full px-2 py-0.5">{count}</span>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500">Not enough data to determine top keywords.</p>
            )}
          </div>
        </div>
      )}
       <p className="text-xs text-slate-500 mt-6">
        Analytics are based on {queryCount} queries stored in the browser's local storage. Stop words are excluded from keyword analysis.
      </p>
    </div>
  );
};

export default TrendsDisplay;