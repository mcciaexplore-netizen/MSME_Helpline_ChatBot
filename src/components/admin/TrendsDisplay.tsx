import React, { useState, useEffect, useMemo } from 'react';
import { getQueryLogs } from '/src/services/loggingService.ts';
import { STOP_WORDS } from '/src/config/constants.ts';
import { QueryLogEntry } from '/src/types/index.ts';
import Card from '/src/components/common/Card.tsx';
import { ChartBarIcon, BookOpenIcon, ChatBubbleLeftRightIcon } from '/src/components/common/Icons.tsx';

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

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <Card className="text-center">
        <div className="mx-auto bg-blue-100 text-blue-600 rounded-full h-12 w-12 flex items-center justify-center">
            {icon}
        </div>
        <p className="text-3xl font-bold text-slate-800 mt-4">{value}</p>
        <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
    </Card>
);

const TrendsDisplay: React.FC = () => {
  const [logs, setLogs] = useState<QueryLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
        setIsLoading(true);
        const fetchedLogs = await getQueryLogs();
        setLogs(fetchedLogs);
        setIsLoading(false);
    };
    fetchTrends();
  }, []);

  const { queryCount, faqHitCount, topKeywords, faqHitRate } = useMemo(() => {
    const queryCount = logs.length;
    if (queryCount === 0) {
        return { queryCount: 0, faqHitCount: 0, topKeywords: [], faqHitRate: '0.00' };
    }
    
    const faqHitCount = logs.filter(log => log.isFaqResult).length;
    const faqHitRate = ((faqHitCount / queryCount) * 100).toFixed(2);
    
    const allQueries = logs.map(log => log.query);
    const wordFreq = countWordFrequency(allQueries);
    const topKeywords = [...wordFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    return { queryCount, faqHitCount, topKeywords, faqHitRate };

  }, [logs]);

  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-slate-600">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Query Trends & Analytics</h2>

      {queryCount === 0 ? (
         <Card><p className="text-slate-600 text-center py-4">No query data available to generate trends.</p></Card>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Queries" value={queryCount} icon={<ChatBubbleLeftRightIcon className="w-6 h-6"/>} />
                <StatCard title="FAQ Hits" value={faqHitCount} icon={<BookOpenIcon className="w-6 h-6"/>} />
                <StatCard title="FAQ Hit Rate" value={`${faqHitRate}%`} icon={<ChartBarIcon className="w-6 h-6"/>} />
            </div>
            
            <Card title="Top Keywords">
                {topKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                    {topKeywords.map(([word, count]) => (
                        <div key={word} className="flex items-center bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
                        <span className="text-sm font-medium text-slate-700">{word}</span>
                        <span className="ml-2 text-xs font-semibold text-white bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">{count}</span>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Not enough data to determine top keywords.</p>
                )}
            </Card>
        </>
      )}
       <p className="text-xs text-slate-500 text-center">
        Analytics are based on {queryCount} queries stored in Supabase. Stop words are excluded from keyword analysis.
      </p>
    </div>
  );
};

export default TrendsDisplay;
