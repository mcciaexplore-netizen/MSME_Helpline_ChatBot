import { TeamMember } from './types';

// NOTE: Replace with your actual Supabase project URL and Anon Key
export const SUPABASE_URL = "https://ctfkjinfjoiwwfklpbcl.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZmtqaW5mam9pd3dma2xwYmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTMyMTQsImV4cCI6MjA3MzIyOTIxNH0.sfxwZ_cAqLGngExLMIwnoOagrB1lWaoOjFXimO7HlPQ";

// NOTE: To get this URL, in your Google Sheet, go to File > Share > Publish to web.
// Select the specific sheet tab (e.g., 'Chat FAQ'), choose 'Comma-separated values (.csv)', and publish.
// Copy the generated link here. Make sure it includes '&output=csv'.
export const GOOGLE_SHEET_FAQ_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSV27KluYPMnDaHit5gQmDZ-vj7z3wKA6H9V9xxiAG3_aCSzM7vsakC-uW7KQzlc66zR2p5qIY8feSx/pub?output=csv';

// NOTE: Do the same for your Video Suggestions sheet tab (e.g., 'Vid_DB').
export const GOOGLE_SHEET_VIDEO_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSV27KluYPMnDaHit5gQmDZ-vj7z3wKA6H9V9xxiAG3_aCSzM7vsakC-uW7KQzlc66zR2p5qIY8feSx/pub?output=csv';

// This is a simplified user management for demo purposes.
// In a real application, this would come from a database.
export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'user-admin', name: 'Admin', role: 'admin', password: 'mccia.adminlogin' },
  { id: 'user-aarya', name: 'Aarya', role: 'member', password: 'mccia.aarya' },
  { id: 'user-aasthak', name: 'Aastha K', role: 'member', password: 'mccia.aasthak' },
  { id: 'user-aasthap', name: 'Aastha P', role: 'member', password: 'mccia.aasthap' },
  { id: 'user-dhananjay', name: 'Dhananjay', role: 'member', password: 'mccia.dhananjay' },
  { id: 'user-surbhi', name: 'Surbhi', role: 'member', password: 'mccia.surbhi' },
  { id: 'user-intern', name: 'Intern', role: 'member', password: 'mccia.intern' },
  { id: 'user-guest', name: 'Guest', role: 'guest', password: null },
];

// This is a simplified admin password for demo purposes.
// In a real application, this should be handled by a secure backend authentication system.
export const ADMIN_PASSWORD = 'mccia.adminlogin';

// Starter prompts for the chat interface
export const STARTER_PROMPT_TOPICS = [
    'Business Registration',
    'Marketing Strategies',
    'Funding Options',
    'Tax Compliance',
];

export const STARTER_PROMPTS: { [key: string]: string } = {
    'Business Registration': 'What are the first steps to register a new small business?',
    'Marketing Strategies': 'Suggest some low-cost marketing strategies for a new local cafe.',
    'Funding Options': 'What are the common funding options available for startups?',
    'Tax Compliance': 'Explain the basics of GST compliance for a small business in India.',
};

// Common English stop words to filter out from query analysis
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  's', 'same', 'she', 'should', 'so', 'some', 'such',
  't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'tell', 'me', 'about', 'what', 'is', 'are', 'the', 'a', 'an', 'of', 'for', 'in', 'on', 'how', 'to', 'can', 'i'
]);

export const DOMAIN_COLORS: { [key: string]: string } = {
  'General': 'bg-slate-400',
  'Marketing': 'bg-blue-500',
  'Finance': 'bg-green-500',
  'Legal': 'bg-red-500',
  'Operations': 'bg-yellow-500',
  'Registration': 'bg-purple-500',
};