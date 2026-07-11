import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import VerifyEmailGate from './components/VerifyEmailGate.jsx';

// Home loads eagerly (it's the landing page, needed immediately).
// Everything else is code-split so first-time visitors don't pay for
// dashboard/legal-page code they may never touch — better Core Web Vitals,
// which factors into search ranking.
const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Privacy = lazy(() => import('./pages/legal/Privacy.jsx'));
const Terms = lazy(() => import('./pages/legal/Terms.jsx'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy.jsx'));
const Contact = lazy(() => import('./pages/legal/Contact.jsx'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <VerifyEmailGate>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </VerifyEmailGate>
  );
}
