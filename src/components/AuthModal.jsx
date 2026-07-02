import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { signInWithGoogle, signInWithEmailOtp, verifyEmailOtp } from '../lib/shared-auth';

// Steps: 'choose' -> pick Google or email
//        'email'  -> type email, send it
//        'sent'   -> either click the link in the inbox, or type the code here
export default function AuthModal({ open, onClose }) {
  const [step, setStep] = useState('choose');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep('choose');
    setEmail('');
    setCode('');
    setError(null);
    setBusy(false);
  };

  const close = () => {
    onClose();
    setTimeout(reset, 200); // let the exit animation finish first
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInWithEmailOtp(email);
      setStep('sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyEmailOtp(email, code);
      close();
      window.location.reload(); // simplest way to refresh auth state everywhere
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-7 shadow-glow"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'choose' && (
              <>
                <h3 className="font-display text-xl font-semibold text-white">Sign in</h3>
                <p className="mt-1 text-sm text-white/50">One account, works on every app here.</p>

                <button
                  onClick={handleGoogle}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-base py-2.5 text-sm font-semibold text-white transition hover:border-violet/50"
                >
                  <svg width="16" height="16" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.4 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14-5l-6.5-5.3c-2 1.5-4.6 2.3-7.5 2.3-5.3 0-9.7-3.1-11.3-8l-6.5 5C9.6 40.5 16.2 45 24 45z"/>
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.7l6.5 5.3C41.6 35.6 45 30.5 45 24c0-1.4-.1-2.5-.4-3.5z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-xs text-white/30">or</span>
                  <div className="h-px flex-1 bg-line" />
                </div>

                <button
                  onClick={() => setStep('email')}
                  className="w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft"
                >
                  Continue with email
                </button>
                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
              </>
            )}

            {step === 'email' && (
              <form onSubmit={handleSendEmail}>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="mb-3 text-xs text-white/40 hover:text-white/70"
                >
                  ← back
                </button>
                <h3 className="font-display text-xl font-semibold text-white">Enter your email</h3>
                <p className="mt-1 text-sm text-white/50">
                  We'll send a sign-in link and a 6-digit code — use whichever's easier.
                </p>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
                />
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
                >
                  {busy ? 'Sending…' : 'Send code & link'}
                </button>
              </form>
            )}

            {step === 'sent' && (
              <form onSubmit={handleVerifyCode}>
                <h3 className="font-display text-xl font-semibold text-white">Check your inbox</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/50">
                  Sent to <span className="text-lavender">{email}</span>. Click the link there, or
                  type the 6-digit code below.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="mt-5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-center text-lg tracking-[0.4em] text-white placeholder:tracking-normal placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
                />
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
                >
                  {busy ? 'Verifying…' : 'Verify code'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/70"
                >
                  Wrong email? Go back
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
