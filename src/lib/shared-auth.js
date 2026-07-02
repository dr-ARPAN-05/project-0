import { supabase } from './supabaseClient';

/**
 * Shared auth utilities for the arpansarkar.org network.
 * Copy this file as-is into any new subdomain app — do not fork the logic,
 * or SSO between apps will silently break.
 */

// Kick off Google OAuth. `next` is where the user should land after the
// callback finishes (defaults to wherever they started).
export async function signInWithGoogle(next = window.location.pathname) {
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
}

// Sign out and always land back on the main domain, per spec.
export async function signOutEverywhere() {
  await supabase.auth.signOut();
  window.location.href = 'https://arpansarkar.org';
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, is_admin, created_at')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export function onAuthStateChange(callback) {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => listener.subscription.unsubscribe();
}
