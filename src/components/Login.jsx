import React, { useState, useEffect } from 'react';
import { BookOpen, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../utils/auth';

export default function Login({ setUser }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const account = mode === 'login'
        ? await loginUser(email, password)
        : await registerUser({ email, password });

      setUser(account);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="login-page">
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-card animate-fade-in">
        <div className="login-logo">
          <BookOpen size={32} color="#fff" />
        </div>

        <div className="login-badge">
          <Zap size={12} /> ND IT 1.1
        </div>

        <h1 className="login-title">{mode === 'login' ? 'Sign in to ND-QUIZ' : 'Register for ND-QUIZ'}</h1>
        <p className="login-subtitle">
          Use your Gmail-style email and password to save quizzes, progress and leaderboard scores.
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            required
          />

          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Processing…' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '1rem' }}
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Create an account' : 'Already have an account? Login'}
        </button>

        {installPrompt && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={handleInstall}
          >
            Install App
          </button>
        )}

        <p className="login-note">
          🔒 Accounts are saved locally and synced to Supabase profiles if configured.
        </p>
      </div>
    </div>
  );
}
