import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AuthCallback from './pages/AuthCallback.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}
