# MCCIA MSME Helpline Chatbot

This is a React-based chatbot application that uses the Google Gemini API to answer queries related to Micro, Small, and Medium Enterprises (MSMEs). It leverages an FAQ database from a Google Sheet for fast, accurate answers and falls back to the Gemini model for more complex questions. The application also includes query logging and user feedback collection using a Supabase backend.

## ✨ Features

- **Dual Response System**: Prioritizes fetching answers from a curated Google Sheet FAQ for speed and accuracy. If no relevant FAQ is found, it queries the Gemini API.
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
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Database**: Supabase (for logging and chat history)
- **Data Source**: Google Sheets (for FAQs and Video Suggestions)

---

## 🚀 Getting Started

This project is designed to run directly in the browser without a complex build setup.

### 1. Prerequisites

- A modern web browser (like Chrome, Firefox, or Edge).
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
- A Supabase project for database features. You can create one for free at [Supabase.io](https://supabase.io/).

### 2. Configuration

#### a. Set up Supabase
1.  After creating your Supabase project, go to the "SQL Editor".
2.  Create the necessary tables by running the SQL queries found in `supabase_schema.sql`.
3.  Go to "Project Settings" > "API".
4.  Find your Project URL and `anon` public key.
5.  Open `constants.ts` and update `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your credentials.

#### b. Set up Google Sheets
1.  Create a Google Sheet with two tabs: one for FAQs (e.g., `Chat FAQ`) and one for video suggestions (e.g., `Vid_DB`).
2.  In each sheet, go to **File > Share > Publish to web**.
3.  Select the correct tab, choose **Comma-separated values (.csv)**, and click **Publish**.
4.  Copy the generated URL for each sheet.
5.  Open `constants.ts` and update `GOOGLE_SHEET_FAQ_URL` and `GOOGLE_SHEET_VIDEO_URL` with your published sheet URLs.

#### c. Set up Gemini API Key (Local Development)

**IMPORTANT**: Never commit your secret API key to a public GitHub repository.

1.  Open the `index.html` file.
2.  Find the following `<script>` block at the bottom of the file:
    ```html
    <script>
      window.process = {
        env: {
          API_KEY: "__GEMINI_API_KEY__" 
        }
      };
    </script>
    ```
3.  Replace the `__GEMINI_API_KEY__` placeholder with your actual Gemini API Key.
    ```diff
    - API_KEY: "__GEMINI_API_KEY__" 
    + API_KEY: "AIzaSy...your...actual...api...key" 
    ```
4.  Save the file. **Do not commit this change if you are using Git.**

### 3. Running the Application

Simply open the `index.html` file in your web browser. A local server can also be used for a better experience.

---

## ☁️ Deployment

You can deploy this application to static hosting providers like Vercel, Netlify, or GitHub Pages.

### Securing Your API Key in Production

The recommended way to handle your Gemini API key is through environment variables on your deployment platform.

**Example for Vercel/Netlify:**

1.  Push your code to a GitHub repository, making sure your `index.html` has the `__GEMINI_API_KEY__` placeholder, **not** your real key.
2.  Connect your GitHub repository to your Vercel or Netlify account.
3.  In your project settings on the deployment platform, find the "Environment Variables" section.
4.  Add a new environment variable.
    -   **Name**: `VITE_GEMINI_API_KEY` (or any name you prefer)
    -   **Value**: Paste your secret Gemini API key.
5.  Modify your build command to replace the placeholder with the environment variable. A common method is using `sed`:
    ```bash
    sed -i "s|__GEMINI_API_KEY__|$VITE_GEMINI_API_KEY|g" index.html
    ```
    This command finds the placeholder string in `index.html` and replaces it with the value of the environment variable during the build process.

Your live application will now use the API key securely without exposing it in your public code.
