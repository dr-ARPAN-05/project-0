import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithGoogle, signInWithEmailOtp, verifyEmailOtp } from '../lib/shared-auth';
import InvisibleCaptcha from './InvisibleCaptcha.jsx';
import ModalShell from './ModalShell.jsx';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.4 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14-5l-6.5-5.3c-2 1.5-4.6 2.3-7.5 2.3-5.3 0-9.7-3.1-11.3-8l-6.5 5C9.6 40.5 16.2 45 24 45z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.7l6.5 5.3C41.6 35.6 45 30.5 45 24c0-1.4-.1-2.5-.4-3.5z" />
  </svg>
);

// One modal, two tabs (Sign up / Log in). Each tab: email flow on top,
// Google below. Both tabs share the same 'code' step once an email is sent.
export default function JoinModal({ open, onClose }) {
  const [tab, setTab] = useState('signup'); // 'signup' | 'login'
  const [step, setStep] = useState('form'); // 'form' | 'code'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const captchaRef = useRef(null);

  const reset = () => {
    setTab('signup');
    setStep('form');
    setName('');
    setEmail('');
    setCode('');
    setError(null);
    setBusy(false);
  };

  const close = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const switchTab = (next) => {
    setTab(next);
    setStep('form');
    setCode('');
    setError(null);
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      if (tab === 'signup') {
        await signInWithEmailOtp(email, { captchaToken, data: { full_name: name.trim() } });
      } else {
        await signInWithEmailOtp(email, { captchaToken, shouldCreateUser: false });
      }
      setStep('code');
    } catch (err) {
      setError(
        tab === 'login' &&
          (err.message?.toLowerCase().includes('signups not allowed') ||
            err.message?.toLowerCase().includes('not found'))
          ? "We couldn't find an account with that email — try the Sign up tab instead."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyEmailOtp(email, code);
      close();
      window.location.reload(); // simplest way to refresh auth state everywhere
    } catch (err) {
      setError(err.message);
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ModalShell open={open} onClose={close}>
        <motion.div
          role="dialog"
          aria-modal="true"
          className="w-full rounded-2xl border border-line bg-panel p-7 shadow-glow"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        >
          {step === 'form' && (
            <>
              <div className="mb-5 flex rounded-lg border border-line bg-base p-1">
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                    tab === 'signup' ? 'bg-violet text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                    tab === 'login' ? 'bg-violet text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Log in
                </button>
              </div>

              <h3 className="font-display text-xl font-semibold text-white">
                {tab === 'signup' ? 'Create your account' : 'Welcome back'}
              </h3>
              <p className="mt-1 text-sm text-white/50">
                One account, works on every app on arpansarkar.org.
              </p>

              <form onSubmit={handleSubmitEmail}>
                {tab === 'signup' && (
                  <>
                    <label className="mt-5 block text-xs font-medium text-white/50">Full name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1.5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
                    />
                  </>
                )}

                <label className={`${tab === 'signup' ? 'mt-4' : 'mt-5'} block text-xs font-medium text-white/50`}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
                />

                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
                >
                  {busy ? 'Sending…' : tab === 'signup' ? 'Send verification code' : 'Send code & link'}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-xs text-white/30">or</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-base py-2.5 text-sm font-semibold text-white transition hover:border-violet/50"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerify}>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="mb-3 text-xs text-white/40 hover:text-white/70"
              >
                ← back
              </button>
              <h3 className="font-display text-xl font-semibold text-white">Enter your code</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/50">
                {tab === 'signup' ? (
                  <>
                    We sent an 8-digit code to <span className="text-lavender">{email}</span>.
                  </>
                ) : (
                  <>
                    Sent to <span className="text-lavender">{email}</span>. Click the link there,
                    or type the 8-digit code below.
                  </>
                )}
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="12345678"
                className="mt-5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-center text-base tracking-[0.25em] text-white placeholder:tracking-normal placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
              />
              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={busy || code.length !== 8}
                className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
              >
                {busy ? 'Verifying…' : tab === 'signup' ? 'Verify & create account' : 'Verify code'}
              </button>
            </form>
          )}
        </motion.div>
      </ModalShell>
      <InvisibleCaptcha ref={captchaRef} />
    </>
  );
}
