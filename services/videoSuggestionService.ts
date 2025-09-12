import { VideoSuggestion } from '../types';
// FIX: Corrected import path for constants.
import { GOOGLE_SHEET_VIDEO_URL } from '../constants';

declare global {
  interface Window {
    Papa: any; // PapaParse, loaded via CDN
  }
}

export const loadVideosFromGoogleSheet = async (): Promise<VideoSuggestion[]> => {
  if (!GOOGLE_SHEET_VIDEO_URL || GOOGLE_SHEET_VIDEO_URL.trim() === '' || GOOGLE_SHEET_VIDEO_URL.includes('YOUR_SHEET_ID')) {
    console.warn(`[Video Service] Google Sheet URL for Videos (GOOGLE_SHEET_VIDEO_URL) is not configured in constants.ts. Video suggestions will be unavailable.`);
    return [];
  }
  try {
    const response = await fetch(GOOGLE_SHEET_VIDEO_URL);
    if (!response.ok) {
      throw new Error(`[Video Service] Failed to fetch Videos: ${response.statusText} (URL: ${GOOGLE_SHEET_VIDEO_URL}). Check if the GID in the URL is correct and the sheet is published.`);
    }
    const csvText = await response.text();
    
    if (!window.Papa) {
        console.error("[Video Service] PapaParse library is not loaded. Cannot parse CSV for videos.");
        throw new Error("CSV parsing library not available.");
    }

    const parsedResult = window.Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, 
    });

    if (parsedResult.errors && parsedResult.errors.length > 0) {
        parsedResult.errors.forEach((error: any) => console.warn("[Video Service] Warning parsing Video CSV row:", error));
    }
    
    const videosFromCsv: any[] = parsedResult.data;

    const requiredColumns = ['Domain', 'Query', 'Video Description', 'Video Link', 'Keywords'];
     if (videosFromCsv.length > 0) {
        const headers = Object.keys(videosFromCsv[0]);
        // Defensive check to see if the FAQ sheet was loaded by mistake
        if (headers.includes('Question') && headers.includes('Solution')) {
            console.error(`[Video Service] Error: The configured GOOGLE_SHEET_VIDEO_URL appears to be pointing to the FAQ sheet, not the 'Vid_DB' sheet. Please check the URL in constants.ts. The video service is expecting columns like 'Query', 'Video Link', etc., but found 'Question' and 'Solution'.`);
            return [];
        }
        const missingCols = requiredColumns.filter(col => !headers.includes(col));
        if (missingCols.length > 0) {
            console.error(`[Video Service] Video Google Sheet ('Vid_DB' tab) is missing required columns: ${missingCols.join(', ')}. Please ensure your sheet has these columns: Domain, Query, Video Description, Video Link, Keywords.`);
            return [];
        }
    } else if (parsedResult.meta && parsedResult.meta.fields && parsedResult.meta.fields.length > 0) {
        const headers: string[] = parsedResult.meta.fields;
        const missingCols = requiredColumns.filter((col: string) => !headers.includes(col));
         if (missingCols.length > 0) {
            console.error(`[Video Service] Video Google Sheet ('Vid_DB' tab) is missing required columns (checked from meta.fields): ${missingCols.join(', ')}. Please ensure your sheet has these columns: Domain, Query, Video Description, Video Link, Keywords.`);
            return [];
        }
    } else if (videosFromCsv.length === 0 && (!parsedResult.meta || !parsedResult.meta.fields || parsedResult.meta.fields.length === 0)){
        console.warn("[Video Service] Video CSV is empty or headers could not be determined. This might happen if the GID in GOOGLE_SHEET_VIDEO_URL is incorrect or the 'Vid_DB' sheet is truly empty. Video suggestions will be unavailable.");
        return [];
    }

    const videos: VideoSuggestion[] = videosFromCsv
      .filter(row => row && requiredColumns.every(col => row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') && String(row['Video Link']).trim() !== '') // Ensure essential columns exist, are not empty, and Link is present
      .map((row: any, index: number) => ({
        id: `video-${Date.now()}-${index}`, 
        domain: String(row['Domain'] || 'General').trim(),
        title: String(row['Query'] || 'Untitled Video').trim(),
        description: String(row['Video Description'] || 'No description available.').trim(),
        link: String(row['Video Link']).trim(),
        keywords: (String(row['Keywords'] || '').split(','))
                    .map((kw: string) => kw.trim().toLowerCase())
                    .filter(Boolean),
    }));

    if (videos.length > 0) {
      console.log(`[Video Service] Successfully loaded ${videos.length} Videos from Google Sheet (Vid_DB tab).`);
    } else {
      console.warn("[Video Service] No videos were loaded. Check if the 'Vid_DB' tab is empty, GID in GOOGLE_SHEET_VIDEO_URL is incorrect, missing video links, or doesn't meet column requirements.");
    }
    return videos;

  } catch (error) {
    console.error(`[Video Service] Error loading Videos from Google Sheet URL (${GOOGLE_SHEET_VIDEO_URL}):`, error);
    return []; // Gracefully degrade, don't crash app
  }
};

export const findRelevantVideos = (userQuery: string, videos: VideoSuggestion[], threshold: number = 1, maxResults: number = 3): VideoSuggestion[] => {
  if (!videos || videos.length === 0) return [];
  
  const userQueryLower = userQuery.toLowerCase();
  let queryWords = new Set((userQueryLower.match(/\b\w{3,}\b/g) || []).map(w => w.toLowerCase())); 
  if (queryWords.size === 0) {
    queryWords = new Set((userQueryLower.match(/\b\w+\b/g) || []).map(w => w.toLowerCase()));
    if (queryWords.size === 0) return [];
  }

  const relevant: Array<VideoSuggestion & { score: number }> = [];

  for (const video of videos) {
    let matchScore = 0;
    const titleLower = (video.title || "").toLowerCase();
    const descriptionLower = (video.description || "").toLowerCase();
    // video.keywords are already lowercased during parsing
    const keywordsString = (video.keywords || []).join(' '); 
    
    const textForMatching = `${titleLower} ${descriptionLower} ${keywordsString}`;
    const videoWords = new Set(textForMatching.match(/\b\w+\b/g) || []);
    
    const commonWords = new Set([...queryWords].filter(word => videoWords.has(word)));
    matchScore = commonWords.size;

    video.keywords.forEach(kw => { // kw is already lowercased
        if (queryWords.has(kw)) {
            matchScore += 2; 
        }
    });
    const titleWords = new Set(titleLower.match(/\b\w+\b/g) || []);
    const commonInTitle = new Set([...queryWords].filter(word => titleWords.has(word)));
    matchScore += commonInTitle.size * 1.5;


    if (matchScore >= threshold) {
      relevant.push({ ...video, score: matchScore });
    }
  }

  relevant.sort((a, b) => b.score - a.score);
  return relevant.slice(0, maxResults); 
};