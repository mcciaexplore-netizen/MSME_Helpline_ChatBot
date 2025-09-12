import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

let supabase: any = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-project-url.supabase.co")) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase client initialized.");
} else {
  console.error("Supabase URL or Anon Key is not provided or is still the default placeholder in constants.ts. Database features will be disabled.");
}

export { supabase };
