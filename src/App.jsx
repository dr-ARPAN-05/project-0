import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import VerifyEmailGate from './components/VerifyEmailGate.jsx';

export default function App() {
  return (
    <VerifyEmailGate>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </VerifyEmailGate>
  );
}
