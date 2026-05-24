import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ModuleView from './components/ModuleView';
import Quiz from './components/Quiz';
import Results from './components/Results';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import './index.css';
import './mobile-enhancements.css';
import { isAdmin } from './utils/admin';
import { ThemeProvider } from './context/ThemeContext';
import { getSessionUser, handleOAuthRedirect } from './supabase';

const PrivateRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      let savedUser = null;
      const saved = localStorage.getItem('quiz_user');

      if (saved) {
        try {
          savedUser = JSON.parse(saved);
          setUser(savedUser);
        } catch (_) {
          localStorage.removeItem('quiz_user');
        }
      }

      const isOAuthRedirect = window.location.search.includes('access_token') || window.location.search.includes('refresh_token') || window.location.search.includes('code=');
      if (!savedUser && isOAuthRedirect) {
        const oauthUser = await handleOAuthRedirect();
        if (oauthUser) {
          setUser(oauthUser);
          setLoading(false);
          return;
        }
      }

      if (!savedUser) {
        const sessionUser = await getSessionUser();
        if (sessionUser) {
          setUser(sessionUser);
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

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
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
          <Route path="/admin-login" element={user ? <Navigate to="/dashboard" replace /> : <AdminLogin setUser={setUser} />} />
          <Route path="/dashboard" element={<PrivateRoute user={user}><Dashboard user={user} setUser={setUser} /></PrivateRoute>} />
          <Route path="/module/:moduleId" element={<PrivateRoute user={user}><ModuleView user={user} /></PrivateRoute>} />
          <Route path="/quiz/:quizId" element={<PrivateRoute user={user}><Quiz user={user} /></PrivateRoute>} />
          <Route path="/results" element={<PrivateRoute user={user}><Results user={user} /></PrivateRoute>} />
          <Route path="/admin" element={isAdmin(user?.email) ? <AdminPanel /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
