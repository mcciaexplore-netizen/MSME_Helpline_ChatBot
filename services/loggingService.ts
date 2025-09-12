
// FIX: Implementing logging service to handle query and feedback logs in localStorage.
import { QueryLogEntry, FeedbackLogEntry } from '../types';

const QUERY_LOG_KEY = 'mccia_msme_query_logs';
const FEEDBACK_LOG_KEY = 'mccia_msme_feedback_logs';

// Helper to safely get/set from localStorage
const getFromStorage = <T>(key: string): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

// ================== Query Logging ==================

export const logQuery = (logEntry: Omit<QueryLogEntry, 'timestamp'>): void => {
  const logs = getFromStorage<QueryLogEntry>(QUERY_LOG_KEY);
  const newLog: QueryLogEntry = {
    ...logEntry,
    timestamp: new Date().toISOString(),
  };
  logs.push(newLog);
  saveToStorage(QUERY_LOG_KEY, logs);
};

export const getQueryLogs = (): QueryLogEntry[] => {
  return getFromStorage<QueryLogEntry>(QUERY_LOG_KEY);
};

export const clearQueryLogs = (): void => {
    try {
        localStorage.removeItem(QUERY_LOG_KEY);
        console.log("Query logs cleared from localStorage.");
    } catch (error) {
        console.error(`Error clearing query logs from localStorage:`, error);
    }
};


// ================== Feedback Logging ==================

export const logFeedback = (logEntry: Omit<FeedbackLogEntry, 'timestamp'>): void => {
  const logs = getFromStorage<FeedbackLogEntry>(FEEDBACK_LOG_KEY);
  const newLog: FeedbackLogEntry = {
    ...logEntry,
    timestamp: new Date().toISOString(),
  };
  logs.push(newLog);
  saveToStorage(FEEDBACK_LOG_KEY, logs);
};

export const getFeedbackLogs = (): FeedbackLogEntry[] => {
  return getFromStorage<FeedbackLogEntry>(FEEDBACK_LOG_KEY);
};

export const clearFeedbackLogs = (): void => {
  try {
    localStorage.removeItem(FEEDBACK_LOG_KEY);
    console.log("Feedback logs cleared from localStorage.");
  } catch (error) {
    console.error(`Error clearing feedback logs from localStorage:`, error);
  }
};
