import { createClient } from '@supabase/supabase-js';
// FIX: Corrected import path for constants.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

let supabase: any = null;

// FIX: Changed strict equality check to .includes() to avoid a TypeScript error when comparing a constant string with a literal. This preserves the check's intent to detect a placeholder URL.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.trim() === "" || SUPABASE_URL.includes("your-project-url.supabase.co")) {
  console.error("Supabase URL or Anon Key is not provided or is still the default placeholder in constants.ts. Database features will be disabled.");
  // To make process.env available for the check below
  if (typeof process === 'undefined') {
      // FIX: Cast window to any to attach a partial process object for browser environment, resolving type error.
      (window as any).process = { env: {} };
  } else if (typeof process.env === 'undefined') {
    // FIX: process.env can be read-only. Cast to any to assign.
    (process as any).env = {};
  }
  process.env.SUPABASE_URL = undefined;
  process.env.SUPABASE_ANON_KEY = undefined;

} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase client initialized.");

  // To make process.env available
  if (typeof process === 'undefined') {
      // FIX: Cast window to any to attach a partial process object for browser environment, resolving type error.
      (window as any).process = { env: {} };
  } else if (typeof process.env === 'undefined') {
    // FIX: process.env can be read-only. Cast to any to assign.
    (process as any).env = {};
  }
  process.env.SUPABASE_URL = SUPABASE_URL;
  process.env.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
}


export { supabase };