import { useAuth } from './useAuth';
import VerifyEmailPrompt from './components/VerifyEmailPrompt.jsx';

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center">
      <p className="font-display text-xl text-white">Sign in to see this page</p>
      <a href="/login" className="mt-4 text-amber underline underline-offset-4">
        Sign in
      </a>
    </div>
  );
}

function NotAuthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center">
      <p className="font-display text-xl text-white">You don't have access to this page</p>
      <a href="/" className="mt-4 text-amber underline underline-offset-4">
        Back to homepage
      </a>
    </div>
  );
}

/**
 * ProtectedRoute checks exactly three things, nothing more:
 *   loading      - is the initial session check still in flight?
 *   authenticated - is there a session at all?
 *   authorized   - (optional) does this route need admin, or a verified email?
 *
 * @param {{children: React.ReactNode, requireAdmin?: boolean, requireVerified?: boolean}} props
 */
export default function ProtectedRoute({ children, requireAdmin = false, requireVerified = false }) {
  const { loading, profileLoading, isAuthenticated, isAdmin, needsEmailVerification } = useAuth();

  if (loading) return <FullScreenSpinner />;
  if (!isAuthenticated) return <SignInPrompt />;
  // Wait for the profile fetch to settle before deciding admin/verification
  // access. Without this, a signed-in user with a not-yet-loaded profile
  // (e.g. right after an OAuth redirect) briefly renders `children`, then
  // gets yanked back out the moment the profile resolves — that flash is
  // what shows up as a "blank dashboard" for Google sign-ins.
  if (profileLoading) return <FullScreenSpinner />;
  if (requireAdmin && !isAdmin) return <NotAuthorized />;
  if (requireVerified && needsEmailVerification) return <VerifyEmailPrompt />;

  return children;
}
