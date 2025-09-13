# MCCIA MSME Helpline Chatbot

This is a React-based chatbot application that uses the Google Gemini API to answer queries related to Micro, Small, and Medium Enterprises (MSMEs). It leverages an FAQ database from a Google Sheet for fast, accurate answers and falls back to the Gemini model for more complex questions. The application also includes query logging and user feedback collection using a Supabase backend.

This project uses a **secure backend proxy** to handle all communication with the Gemini API, ensuring that the API key is never exposed to the user's browser.

## ✨ Features

- **Secure API Handling**: All requests to the Gemini API are routed through a secure backend proxy (`/api/generate`), so your API key remains safe on the server.
- **Dual Response System**: Prioritizes fetching answers from a curated Google Sheet FAQ for speed and accuracy. If no relevant FAQ is found, it securely queries the Gemini API.
- **Video Suggestions**: Recommends relevant YouTube videos based on the user's query.
- **User Authentication**: A simple, demo-oriented login system to identify different users.
- **Chat History**: Saves and displays past chat conversations for each user, powered by Supabase.
- **Admin Dashboard**: A comprehensive panel for administrators to view:
    - **Trends & Analytics**: See total queries, FAQ hit rate, and top keywords.
    - **Knowledge Base Optimization**: Review AI-answered questions to identify new potential FAQs.
    - **Query Logs**: Browse a detailed history of all user queries.
    - **Feedback Logs**: View all user feedback (`👍`/`👎`) on the bot's responses.
- **Responsive Design**: Clean and modern UI that works on both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React (via esm.sh, no build step)
- **Backend**: Vercel Serverless Functions (as a secure API proxy)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Database**: Supabase (for logging and chat history)
- **Data Source**: Google Sheets (for FAQs and Video Suggestions)

## 🏛️ Project Structure

The project follows a modern, organized structure:

```
/
├── api/                  # Vercel Serverless Functions (Backend)
│   └── generate.ts
├── src/                  # All frontend source code
│   ├── components/       # React components (auth, admin, chat, common)
│   ├── config/           # App-wide constants
│   ├── services/         # Business logic (API calls, data processing)
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── index.html            # Main HTML file
└── ... (other config files)
```

---

## 🚀 Getting Started & Deployment

This project is designed to be deployed on a platform that supports serverless functions, like Vercel.

### 1. Prerequisites

- A [Vercel](https://vercel.com/) account (or a similar hosting provider).
- A [GitHub](https://github.com/) account.
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
- A Supabase project for database features. You can create one for free at [Supabase.io](https://supabase.io/).

### 2. Configuration Steps

#### a. Fork & Deploy
1.  **Fork** this repository to your own GitHub account.
2.  Go to your Vercel dashboard and click **Add New... > Project**.
3.  Import the forked GitHub repository. Vercel will automatically detect the project settings.

#### b. Set up Supabase
1.  After creating your Supabase project, go to the **SQL Editor**.
2.  Create the necessary tables by running the SQL queries found in `supabase_schema.sql` (if provided).
3.  Go to **Project Settings > API**. Find your Project URL and `anon` public key.
4.  Open `src/config/constants.ts` and update `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your credentials. Commit and push this change.

#### c. Set up Google Sheets
1.  Create a Google Sheet with two tabs: one for FAQs (e.g., `Chat FAQ`) and one for video suggestions (e.g., `Vid_DB`).
2.  In each sheet, go to **File > Share > Publish to web**.
3.  Select the correct tab, choose **Comma-separated values (.csv)**, and click **Publish**.
4.  Copy the generated URL for each sheet.
5.  Open `src/config/constants.ts` and update `GOOGLE_SHEET_FAQ_URL` and `GOOGLE_SHEET_VIDEO_URL` with your published sheet URLs. Commit and push this change.

#### d. Set up the Secure Gemini API Key
This is the most important step for security. The API key is stored as a server-side environment variable, never in your code.

1.  In your Vercel project dashboard, go to **Settings > Environment Variables**.
2.  Add a new environment variable:
    -   **Name**: `GEMINI_API_KEY`
    -   **Value**: Paste your secret Gemini API key here.
3.  Ensure the variable is available for all environments (Production, Preview, and Development). Click **Save**.
4.  Redeploy your project in Vercel to apply the new environment variable.

Your live application will now use the API key securely through the backend proxy without ever exposing it to the public.

### 3. Local Development

To run the application locally with the backend proxy, you need to use the Vercel CLI.

1.  Install the Vercel CLI: `npm install -g vercel`
2.  Link your project: `vercel link`
3.  Pull environment variables: `vercel env pull .env.development.local`
4.  Run the development server: `vercel dev`

This will start a local server that mimics the Vercel environment, allowing your frontend to communicate with the serverless function in the `/api` directory.
