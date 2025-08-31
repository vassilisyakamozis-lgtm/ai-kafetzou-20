// Re-export the existing Supabase client to avoid duplicates
export { supabase } from '@/integrations/supabase/client';
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  }
);
