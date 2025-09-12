

// FIX: Defining all TypeScript types used across the application.
export type TeamMember = {
  id: string;
  name: string;
  role: 'admin' | 'member' | 'guest';
  password?: string | null; // Password can be null for guests
};

export type ChatMessageRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string;
  feedback?: '👍' | '👎' | null;
  isFeedbackSubmitted?: boolean;
  searchedForVideos?: boolean; // Flag to indicate if video search was performed for this response
  videoSuggestions?: VideoSuggestion[]; // Array of relevant videos
};

export type FAQ = {
  Question: string;
  Solution: string;
  KeyWords: string[];
  Domain: string;
};

export type VideoSuggestion = {
    id: string;
    domain: string;
    title: string;
    description: string;
    link: string;
    keywords: string[];
};

export interface QueryLogEntry {
    timestamp: string;
    userId: string;
    userName: string;
    query: string;
    response: string;
    isFaqResult: boolean;
    relevantFaqs: FAQ[];
    videoSuggestions: VideoSuggestion[];
}

export interface FeedbackLogEntry {
    timestamp: string;
    userId: string;
    userName: string;
    query: string;
    response: string;
    feedback: '👍' | '👎';
}

export interface ChatHistory {
    id: string; // uuid from Supabase
    created_at: string; // timestamp from Supabase
    user_id: string;
    user_name: string;
    initial_query: string;
    domain: string;
    messages: ChatMessage[];
}