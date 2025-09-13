import { FAQ } from '../types';
import { GOOGLE_SHEET_FAQ_URL } from '../config/constants';

declare global {
  interface Window {
    Papa: any; // PapaParse, loaded via CDN
  }
}

export const loadFaqsFromGoogleSheet = async (): Promise<FAQ[]> => {
  if (!GOOGLE_SHEET_FAQ_URL || GOOGLE_SHEET_FAQ_URL.trim() === '' || GOOGLE_SHEET_FAQ_URL.includes('YOUR_SHEET_ID')) {
    console.warn(`[FAQ Service] Google Sheet URL for FAQs (GOOGLE_SHEET_FAQ_URL) is not configured in constants.ts. FAQs will be unavailable.`);
    return [];
  }
  try {
    const response = await fetch(GOOGLE_SHEET_FAQ_URL);
    if (!response.ok) {
      throw new Error(`[FAQ Service] Failed to fetch FAQs: ${response.statusText} (URL: ${GOOGLE_SHEET_FAQ_URL}). Check if the GID in the URL is correct and the sheet is published.`);
    }
    const csvText = await response.text();
    
    if (!window.Papa) {
        console.error("[FAQ Service] PapaParse library is not loaded. Cannot parse CSV for FAQs.");
        throw new Error("CSV parsing library not available.");
    }

    const parsedResult = window.Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, 
    });

    if (parsedResult.errors && parsedResult.errors.length > 0) {
        parsedResult.errors.forEach((error: any) => console.warn("[FAQ Service] Warning parsing FAQ CSV row:", error));
    }
    
    const faqsFromCsv: any[] = parsedResult.data;

    const requiredColumns = ['Question', 'Solution', 'Key Words'];
    if (faqsFromCsv.length > 0) { 
        const headers = Object.keys(faqsFromCsv[0]);
        // Defensive check to see if the video sheet was loaded by mistake
        if (headers.includes('Video Link') && headers.includes('Video Description')) {
            console.error(`[FAQ Service] Error: The configured GOOGLE_SHEET_FAQ_URL appears to be pointing to the Video sheet ('Vid_DB'), not the 'Chat FAQ' sheet. Please check the URL in constants.ts. The FAQ service is expecting columns like 'Question' and 'Solution', but found 'Video Link' and 'Video Description'.`);
            return [];
        }
        const missingCols = requiredColumns.filter(col => !headers.includes(col));
        if (missingCols.length > 0) {
            console.error(`[FAQ Service] FAQ Google Sheet ('Chat FAQ' tab) is missing required columns: ${missingCols.join(', ')}. Please ensure your sheet has these columns.`);
            return []; 
        }
    } else if (parsedResult.meta && parsedResult.meta.fields && parsedResult.meta.fields.length > 0) { 
        const headers: string[] = parsedResult.meta.fields;
        const missingCols = requiredColumns.filter((col: string) => !headers.includes(col));
         if (missingCols.length > 0) {
            console.error(`[FAQ Service] FAQ Google Sheet ('Chat FAQ' tab) is missing required columns (checked from meta.fields): ${missingCols.join(', ')}. Please ensure your sheet has these columns.`);
            return []; 
        }
    } else if (faqsFromCsv.length === 0 && (!parsedResult.meta || !parsedResult.meta.fields || parsedResult.meta.fields.length === 0)){
        console.warn("[FAQ Service] FAQ CSV is empty or headers could not be determined. This might happen if the GID in GOOGLE_SHEET_FAQ_URL is incorrect or the 'Chat FAQ' sheet is truly empty.");
        return []; 
    }


    const faqs: FAQ[] = faqsFromCsv
      .filter(row => row && requiredColumns.every(col => row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '')) // Ensure essential columns exist and are not empty
      .map((row: any) => ({
        Question: String(row['Question'] || 'No Question Provided').trim(),
        Solution: String(row['Solution'] || 'No Solution Provided').trim(),
        KeyWords: (String(row['Key Words'] || '').split(','))
                    .map((kw: string) => kw.trim().toLowerCase()) // Normalize keywords to lowercase
                    .filter(Boolean),
        Domain: String(row['Domain'] || 'General').trim(),
    }));

    if (faqs.length > 0) {
      console.log(`[FAQ Service] Successfully loaded ${faqs.length} FAQs from Google Sheet (Chat FAQ tab).`);
    } else {
      console.warn("[FAQ Service] No FAQs were loaded. Check if the 'Chat FAQ' tab is empty, GID in GOOGLE_SHEET_FAQ_URL is incorrect, or sheet doesn't meet column requirements.");
    }
    return faqs;

  } catch (error) {
    console.error(`[FAQ Service] Error loading FAQs from Google Sheet URL (${GOOGLE_SHEET_FAQ_URL}):`, error);
    return []; // Gracefully degrade, don't crash the app
  }
};

export const findRelevantFaqs = (userQuery: string, faqs: FAQ[], threshold: number = 1): FAQ[] => {
  if (!faqs || faqs.length === 0) return [];
  
  const userQueryLower = userQuery.toLowerCase();
  const queryWords = new Set((userQueryLower.match(/\b\w{3,}\b/g) || []).map(w => w.toLowerCase())); 
  if (queryWords.size === 0) { 
    const shortQueryWords = new Set((userQueryLower.match(/\b\w+\b/g) || []).map(w => w.toLowerCase()));
    if (shortQueryWords.size === 0) return [];
    shortQueryWords.forEach(w => queryWords.add(w));
  }


  const relevant: Array<FAQ & { score: number }> = [];

  for (const faq of faqs) {
    let matchScore = 0;
    const faqQuestionLower = (faq.Question || "").toLowerCase();
    // Keywords are already an array of lowercased strings
    const faqKeywordsString = (faq.KeyWords || []).join(' '); 
    
    const textForMatching = `${faqQuestionLower} ${faqKeywordsString}`;
    const faqWords = new Set(textForMatching.match(/\b\w+\b/g) || []); // These are already lowercased from source or here
    
    const commonWords = new Set([...queryWords].filter(word => faqWords.has(word)));
    matchScore = commonWords.size;

     // Boost score for direct keyword matches from FAQ's `KeyWords`
    faq.KeyWords.forEach(kw => { // kw is already lowercased
        if (queryWords.has(kw)) {
            matchScore += 2; // Add more weight to explicit keyword matches
        }
    });
     // Boost score for matches in FAQ's `Question`
    const questionWords = new Set(faqQuestionLower.match(/\b\w+\b/g) || []);
    const commonInQuestion = new Set([...queryWords].filter(word => questionWords.has(word)));
    matchScore += commonInQuestion.size * 1.5; // Slightly less boost than direct keywords
    
    if (matchScore >= threshold) {
      relevant.push({ ...faq, score: matchScore });
    }
  }

  relevant.sort((a, b) => b.score - a.score);
  return relevant.slice(0, 3); 
};
