import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ModuleView from './components/ModuleView';
import Quiz from './components/Quiz';
import Results from './components/Results';
import './index.css';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { isAdmin } from './utils/admin';

const PrivateRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage (mock auth persistence)
  useEffect(() => {
    const saved = localStorage.getItem('quiz_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (_) {}
    }
    setLoading(false);
  }, []);

  // Persist user to localStorage on change
  useEffect(() => {
    if (user) localStorage.setItem('quiz_user', JSON.stringify(user));
    else localStorage.removeItem('quiz_user');
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', color: '#64748b', fontFamily: 'Inter,sans-serif' }}>
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
          <Route path="/dashboard" element={<PrivateRoute user={user}><Dashboard user={user} setUser={setUser} /></PrivateRoute>} />
          <Route path="/module/:moduleId" element={<PrivateRoute user={user}><ModuleView user={user} /></PrivateRoute>} />
          <Route path="/quiz/:quizId" element={<PrivateRoute user={user}><Quiz user={user} /></PrivateRoute>} />
          <Route path="/results" element={<PrivateRoute user={user}><Results user={user} /></PrivateRoute>} />
          <Route path="/admin" element={isAdmin(user?.email) ? <AdminPanel /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Footer />
    </>
  );
}

export default App;
