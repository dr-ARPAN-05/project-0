import { useAuth } from '../auth/useAuth';
import ScoreCard from '../components/dashboard/ScoreCard.jsx';
import StudentPurchases from '../components/dashboard/StudentPurchases.jsx';
import AdminOrders from '../components/dashboard/AdminOrders.jsx';
import NamePrompt from '../components/dashboard/NamePrompt.jsx';
import SEO from '../components/SEO.jsx';

// Auth is already resolved by the time this renders — App.jsx wraps this
// route in <ProtectedRoute requireVerified>, so we only ever get here with
// a session, a loaded profile, and a verified email. No loading/session
// branching needed here anymore.
export default function Dashboard() {
  const { session, profile, isAdmin, signOut, refreshProfile } = useAuth();

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
            onClick={signOut}
            className="rounded-full border border-line px-4 py-2 text-sm text-white/70 transition hover:border-violet/50 hover:text-white"
          >
            Sign out
          </button>
        </div>

        <div className="mt-10">
          {needsName && <NamePrompt userId={session.user.id} onSaved={refreshProfile} />}

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
