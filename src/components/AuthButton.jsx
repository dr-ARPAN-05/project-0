import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSession, onAuthStateChange, signOutEverywhere } from '../lib/shared-auth';
import AuthModal from './AuthModal.jsx';
import SignUpModal from './SignUpModal.jsx';

export default function AuthButton({ className = '' }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  useEffect(() => {
    getSession()
      .then(setSession)
      .finally(() => setLoading(false));
    return onAuthStateChange(setSession);
  }, []);

  if (loading) {
    return <div className={`h-9 w-24 animate-pulse rounded-full bg-panel ${className}`} />;
  }

  if (session) {
    const email = session.user?.email || '';
    const initial = email.charAt(0).toUpperCase() || 'A';
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link
          to="/dashboard"
          className="rounded-full border border-line px-3.5 py-1.5 text-sm text-white/70 transition hover:border-violet/50 hover:text-white"
        >
          Dashboard
        </Link>
        <button
          onClick={signOutEverywhere}
          title={`Signed in as ${email} — click to sign out`}
          className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-sm text-white/80 transition hover:border-violet/50 hover:text-white"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet text-xs font-semibold text-white">
            {initial}
          </span>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => setSignInOpen(true)}
        className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-violet/50 hover:text-white"
      >
        Sign in
      </button>
      <button
        onClick={() => setSignUpOpen(true)}
        className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-soft"
      >
        Sign up
      </button>
      <AuthModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <SignUpModal open={signUpOpen} onClose={() => setSignUpOpen(false)} />
    </div>
  );
}
