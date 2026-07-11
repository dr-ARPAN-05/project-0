import { useEffect, useState } from 'react';
import { getSession, onAuthStateChange, getProfile, signOutEverywhere } from '../lib/shared-auth';
import ScoreCard from '../components/dashboard/ScoreCard.jsx';
import StudentPurchases from '../components/dashboard/StudentPurchases.jsx';
import AdminOrders from '../components/dashboard/AdminOrders.jsx';
import NamePrompt from '../components/dashboard/NamePrompt.jsx';
import SEO from '../components/SEO.jsx';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setSession(s);
      if (s) setProfile(await getProfile(s.user.id));
      setLoading(false);
    })();
    return onAuthStateChange(async (s) => {
      setSession(s);
      setProfile(s ? await getProfile(s.user.id) : null);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center">
        <p className="font-display text-xl text-white">Sign in to see your dashboard</p>
        <a href="/" className="mt-4 text-amber underline underline-offset-4">
          Back to homepage
        </a>
      </div>
    );
  }

  const isAdmin = profile?.is_admin;
  const needsName = !profile?.full_name;

  return (
    <div className="min-h-screen bg-base px-5 py-10 md:py-14">
      <SEO title="Dashboard — arpansarkar.org" path="/dashboard" noindex />
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">
              {isAdmin ? 'Admin dashboard' : 'Your dashboard'}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white md:text-3xl">
              {isAdmin
                ? 'Orders'
                : `Welcome back${profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}`}
            </h1>
          </div>
          <button
            onClick={signOutEverywhere}
            className="rounded-full border border-line px-4 py-2 text-sm text-white/70 transition hover:border-violet/50 hover:text-white"
          >
            Sign out
          </button>
        </div>

        <div className="mt-10">
          {needsName && (
            <NamePrompt
              userId={session.user.id}
              onSaved={(name) => setProfile((p) => ({ ...p, full_name: name }))}
            />
          )}

          {isAdmin ? (
            <AdminOrders />
          ) : (
            <div className="space-y-10">
              <ScoreCard profile={profile} session={session} />
              <div>
                <h2 className="mb-4 font-display text-lg font-semibold text-white">Your purchases</h2>
                <StudentPurchases userId={session.user.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
