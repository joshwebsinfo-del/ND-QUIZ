import React, { useState } from 'react';
import { BookOpen, Zap } from 'lucide-react';
import { signInWithGoogle } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
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

        <h1 className="login-title">Quiz Portal</h1>
        <p className="login-subtitle">
          Hardware · Network · Software · OOP · Database
        </p>
        <p className="login-desc">
          Register with your Gmail account to save progress, view the leaderboard, and access your modules.
        </p>

        <button className="btn-google" onClick={handleLogin} disabled={loading}>
          {loading ? (
            <><div className="spinner-sm" /> Signing in...</>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '1rem' }}
          onClick={() => navigate('/admin-login')}
        >
          Admin Login
        </button>

        <p className="login-note">
          🔒 Sign in with the same Gmail address you registered on Supabase.
        </p>
      </div>
    </div>
  );
}
