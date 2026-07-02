import { createClient } from '@supabase/supabase-js';

// Cross-subdomain SSO relies on two things matching exactly across every
// app on *.arpansarkar.org: the storageKey, and the cookie domain below
// (set at the hosting/proxy or via a custom storage adapter if you move
// off localStorage). Do not change either without updating every subdomain.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly in dev rather than silently breaking auth later.
  console.error(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Check your .env file against .env.example.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storageKey: 'arpansarkar-auth', // exact string — shared across every subdomain app
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // required for the OAuth callback flow
  },
});

// Cookie domain used when apps are deployed on production subdomains.
// Only applied in production so local dev on localhost isn't broken.
export const COOKIE_DOMAIN =
  typeof window !== 'undefined' && window.location.hostname.endsWith('arpansarkar.org')
    ? '.arpansarkar.org'
    : undefined;
