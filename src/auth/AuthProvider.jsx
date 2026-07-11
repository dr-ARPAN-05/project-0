import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  getSession,
  onAuthStateChange,
  ensureProfile,
  signOutEverywhere,
} from './AuthService';

/** @type {import('react').Context<import('./authTypes').AuthContextValue|null>} */
export const AuthContext = createContext(null);

/**
 * AuthProvider — mounted ONCE in main.jsx, above everything else.
 *
 * This is the single source of truth for auth state:
 *  - Calls getSession() exactly once, on mount.
 *  - Owns the ONLY supabase.auth.onAuthStateChange subscription in the app.
 *  - Owns profile loading (with auto-create via ensureProfile so a missing
 *    row never crashes a page).
 *
 * Nothing else in the app should call getSession() or subscribe to auth
 * state changes directly — read from useAuth() instead. That's what
 * eliminates the race conditions / redirect loops / blank screens that
 * come from multiple independent listeners disagreeing about the current
 * session.
 */
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guards against a stale profile fetch (from a previous session/user)
  // resolving after a newer one has already started — the classic race
  // condition source when auth state changes rapidly (e.g. during OAuth).
  const requestIdRef = useRef(0);

  const loadProfileFor = useCallback(async (nextSession) => {
    const requestId = ++requestIdRef.current;
    const user = nextSession?.user ?? null;

    if (!user) {
      if (requestId === requestIdRef.current) setProfile(null);
      return;
    }

    const p = await ensureProfile(user);
    if (requestId === requestIdRef.current) setProfile(p);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const s = await getSession();
        if (cancelled) return;
        setSession(s);
        await loadProfileFor(s);
      } catch (err) {
        console.error('[AuthProvider] initial session check failed:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const unsubscribe = onAuthStateChange((nextSession) => {
      setSession(nextSession);
      loadProfileFor(nextSession);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [loadProfileFor]);

  const refreshProfile = useCallback(() => loadProfileFor(session), [loadProfileFor, session]);

  const value = {
    user: session?.user ?? null,
    session,
    profile,
    loading,
    isAuthenticated: !!session,
    isAdmin: !!profile?.is_admin,
    needsEmailVerification: !!session && !!profile && profile.is_verified === false,
    needsName: !!session && !!profile && !profile.full_name,
    refreshProfile,
    signOut: signOutEverywhere,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
