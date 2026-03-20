import { createClient } from '@supabase/supabase-js'

// Check localStorage first, then fallback to environment variables
const getSupabaseConfig = () => {
  const storedUrl = localStorage.getItem('SUPABASE_EXTERNAL_URL');
  const storedKey = localStorage.getItem('SUPABASE_EXTERNAL_KEY');
  
  return {
    url: storedUrl || import.meta.env.VITE_SUPABASE_URL || '',
    key: storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

const config = getSupabaseConfig();

if (!config.url || !config.key) {
  console.warn('Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets or via the Settings menu.');
}

// Using a placeholder URL if missing to prevent "supabaseUrl is required" error on startup
export const supabase = createClient(
  config.url || 'https://placeholder.supabase.co', 
  config.key || 'placeholder'
)

// Helper to update the client if values change (requires page reload for simplicity)
export const updateSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('SUPABASE_EXTERNAL_URL', url);
  localStorage.setItem('SUPABASE_EXTERNAL_KEY', key);
  window.location.reload();
};

export const resetSupabaseConfig = () => {
  localStorage.removeItem('SUPABASE_EXTERNAL_URL');
  localStorage.removeItem('SUPABASE_EXTERNAL_KEY');
  window.location.reload();
};
