import { supabase } from './supabaseService';
import { QueryLogEntry, FeedbackLogEntry } from '../types';

if (!supabase) {
    console.warn("Supabase client not initialized. Logging service will be disabled.");
}

// ================== Query Logging ==================

export const logQuery = async (logEntry: Omit<QueryLogEntry, 'timestamp' | 'id'>): Promise<void> => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('query_logs').insert({
        user_id: logEntry.userId,
        user_name: logEntry.userName,
        query: logEntry.query,
        response: logEntry.response,
        is_faq_result: logEntry.isFaqResult,
        relevant_faqs: logEntry.relevantFaqs,
        video_suggestions: logEntry.videoSuggestions,
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error logging query to Supabase:', error);
  }
};

export const getQueryLogs = async (): Promise<QueryLogEntry[]> => {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase
            .from('query_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Map snake_case from db to camelCase for app
        return data.map((log: any) => ({
            id: log.id,
            timestamp: log.created_at,
            userId: log.user_id,
            userName: log.user_name,
            query: log.query,
            response: log.response,
            isFaqResult: log.is_faq_result,
            relevantFaqs: log.relevant_faqs || [],
            videoSuggestions: log.video_suggestions || [],
        }));
    } catch (error) {
        console.error('Error fetching query logs from Supabase:', error);
        return [];
    }
};

export const clearQueryLogs = async (): Promise<void> => {
    if (!supabase) return;
    try {
        // Deletes all rows in the table. The `neq` is a workaround for RLS policies.
        const { error } = await supabase.from('query_logs').delete().neq('id', -1); 
        if (error) throw error;
        console.log("Query logs cleared from Supabase.");
    } catch (error) {
        console.error('Error clearing query logs:', error);
    }
};


// ================== Feedback Logging ==================

export const logFeedback = async (logEntry: Omit<FeedbackLogEntry, 'timestamp' | 'id'>): Promise<void> => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('feedback_logs').insert({
            user_id: logEntry.userId,
            user_name: logEntry.userName,
            query: logEntry.query,
            response: logEntry.response,
            feedback: logEntry.feedback,
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error logging feedback to Supabase:', error);
    }
};

export const getFeedbackLogs = async (): Promise<FeedbackLogEntry[]> => {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase
            .from('feedback_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return data.map((log: any) => ({
            id: log.id,
            timestamp: log.created_at,
            userId: log.user_id,
            userName: log.user_name,
            query: log.query,
            response: log.response,
            feedback: log.feedback,
        }));
    } catch (error) {
        console.error('Error fetching feedback logs from Supabase:', error);
        return [];
    }
};

export const clearFeedbackLogs = async (): Promise<void> => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('feedback_logs').delete().neq('id', -1);
    if (error) throw error;
    console.log("Feedback logs cleared from Supabase.");
  } catch (error) {
    console.error(`Error clearing feedback logs from Supabase:`, error);
  }
};