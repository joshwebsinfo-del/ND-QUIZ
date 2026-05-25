import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Trophy } from 'lucide-react';
import { logoutUser } from '../utils/auth';
import { isAdmin } from '../utils/admin';
import { modulesData } from '../data/modules';
import ThemeSwitcher from './ThemeSwitcher';

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [secretClicks, setSecretClicks] = useState(0);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const secretTimerRef = useRef(null);
  const canUnlockAdmin = isAdmin(user?.email);

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

  useEffect(() => {
    return () => {
      clearTimeout(secretTimerRef.current);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSecretTap = () => {
    if (!canUnlockAdmin) return;
    setSecretClicks((prev) => {
      const next = prev + 1;
      if (next >= 7) {
        setShowAdminSecret(true);
      }
      return next;
    });
    clearTimeout(secretTimerRef.current);
    secretTimerRef.current = window.setTimeout(() => {
      setSecretClicks(0);
    }, 4000);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate('/');
  };

  const isAdminUser = user?.isAdmin === true;

  return (
    <div className="animate-fade-in">
      <nav className="navbar">
        <button type="button" className="nav-brand secret-trigger" onClick={handleSecretTap}>
          <BookOpen size={22} />
          ND IT 1.1 Portal
        </button>
        <div className="user-profile">
          <ThemeSwitcher />
          {installPrompt && (
            <button className="btn btn-primary btn-sm" onClick={handleInstall} style={{ marginRight: '0.75rem' }}>
              Install App
            </button>
          )}
          {isAdminUser && (
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin')} style={{ marginRight: '0.75rem' }}>
              Admin Panel
            </button>
          )}
          {showAdminSecret && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin')} style={{ marginRight: '0.75rem' }}>
              Secret Admin Portal
            </button>
          )}
          <span className="user-name">{user?.displayName?.split(' ')[0]}</span>
          <img
            src={user?.avatar_url || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=4f46e5&color=fff`}
            alt="Profile"
            className="avatar"
          />
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-layout container">
        {canUnlockAdmin && secretClicks > 0 && !showAdminSecret && (
          <div className="admin-secret-hint animate-slide-in">
            🔐 Tap the logo {7 - secretClicks} more time{7 - secretClicks === 1 ? '' : 's'} to unlock admin access.
          </div>
        )}
        <div className="modules-section">
          <div className="section-header">
            <h2 className="rainbow-text">Your Modules</h2>
            <p className="text-muted">Select a module to begin quizzing</p>
            {user?.isAdmin && (
              <div className="admin-status-badge">Admin Super Access</div>
            )}
          </div>
          <div className="dashboard-actions" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => navigate('/leaderboard')}>
              View Module League Table
            </button>
          </div>
          <div className="modules-grid">
            {modulesData.map((mod, i) => (
              <button
                key={mod.id}
                className="module-card animate-fade-in"
                style={{ '--module-color': mod.color, animationDelay: `${i * 0.07}s` }}
                onClick={() => navigate(`/module/${mod.id}`)}
              >
                <div className="module-icon-wrap">
                  <span className="module-emoji">{mod.icon}</span>
                </div>
                <div className="module-info">
                  <h3>{mod.title}</h3>
                  <span className="module-code">{mod.code}</span>
                  <p>{mod.description}</p>
                  <div className="module-meta">
                    <span className="quiz-count-badge">{mod.quizzes.length} quizzes</span>
                  </div>
                </div>
                <div className="module-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
