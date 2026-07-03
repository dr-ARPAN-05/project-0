import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Privacy from './pages/legal/Privacy.jsx';
import Terms from './pages/legal/Terms.jsx';
import RefundPolicy from './pages/legal/RefundPolicy.jsx';
import Contact from './pages/legal/Contact.jsx';
import VerifyEmailGate from './components/VerifyEmailGate.jsx';

export default function App() {
  return (
    <VerifyEmailGate>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </VerifyEmailGate>
  );
}
