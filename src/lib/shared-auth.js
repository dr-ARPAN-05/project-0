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

// Email sign-in/signup, step 1: send the email. The same email carries both a
// clickable magic link (routes through /auth/callback) AND a 6-digit code
// (verified manually via verifyEmailOtp) — the template controls which
// pieces show up. captchaToken is required once hCaptcha is enabled in
// Supabase. Pass data: { full_name } on signup so the new-user trigger
// picks it up. Pass shouldCreateUser: false for a pure sign-in flow so a
// mistyped/unknown email fails clearly instead of quietly creating an account.
export async function signInWithEmailOtp(
  email,
  { next = window.location.pathname, captchaToken, data, shouldCreateUser = true } = {}
) {
  const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const options = { emailRedirectTo, shouldCreateUser, captchaToken };
  if (data) options.data = data;
  const { error } = await supabase.auth.signInWithOtp({ email, options });
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

// Sends a fresh 6-digit code to an ALREADY-signed-in user (e.g. a first-time
// Google sign-up we need to gate). shouldCreateUser: false because this
// user already exists — we're just re-confirming their email.
export async function sendVerificationCode(email, captchaToken) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, captchaToken },
  });
  if (error) throw error;
}

// Call AFTER verifyEmailOtp() succeeds. The actual trust decision happens
// server-side in the confirm_email_verification() Postgres function, which
// checks Supabase's own record of a recent email confirmation rather than
// taking the client's word for it. Returns true only if that check passed.
export async function confirmEmailVerification() {
  const { data, error } = await supabase.rpc('confirm_email_verification');
  if (error) throw error;
  return data === true;
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
