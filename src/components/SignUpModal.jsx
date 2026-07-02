import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { signInWithEmailOtp, verifyEmailOtp } from '../lib/shared-auth';
import InvisibleCaptcha from './InvisibleCaptcha.jsx';

// Steps: 'form' -> name + email, 'code' -> enter the 6-digit code
// Note: unlike sign-in, the signup confirmation email only carries a code,
// no clickable link — so this step never mentions "click the link".
export default function SignUpModal({ open, onClose }) {
  const [step, setStep] = useState('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const captchaRef = useRef(null);

  const reset = () => {
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

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await signInWithEmailOtp(email, { captchaToken, data: { full_name: name.trim() } });
      setStep('code');
    } catch (err) {
      setError(err.message);
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
            {step === 'form' && (
              <form onSubmit={handleSubmitForm}>
                <h3 className="font-display text-xl font-semibold text-white">Create your account</h3>
                <p className="mt-1 text-sm text-white/50">
                  One account, works on every app on arpansarkar.org.
                </p>

                <label className="mt-5 block text-xs font-medium text-white/50">Full name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
                />

                <label className="mt-4 block text-xs font-medium text-white/50">Email</label>
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
                  {busy ? 'Sending…' : 'Send verification code'}
                </button>
              </form>
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
                  We sent a 8-digit code to <span className="text-lavender">{email}</span>.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="00000000"
                  className="mt-5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-center text-lg tracking-[0.4em] text-white placeholder:tracking-normal placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
                />
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
                >
                  {busy ? 'Verifying…' : 'Verify & create account'}
                </button>
              </form>
            )}
          </motion.div>
          <InvisibleCaptcha ref={captchaRef} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
