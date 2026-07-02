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

// Email sign-in, step 1: send the email. The same email carries both a
// clickable magic link (routes through /auth/callback) AND a 6-digit code
// (verified manually via verifyEmailOtp) — the template controls which
// pieces show up, both are enabled by default once emailRedirectTo is set.
export async function signInWithEmailOtp(email, next = window.location.pathname) {
  const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo, shouldCreateUser: true },
  });
  if (error) throw error;
}

// Email sign-in, step 2 (only needed if the user types the code instead of
// clicking the link). Resolves once the session is active.
export async function verifyEmailOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return data.session;
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
