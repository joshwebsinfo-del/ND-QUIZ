import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Trophy } from 'lucide-react';
import { logout } from '../firebase';
import { modulesData } from '../data/modules';
import Leaderboard from './Leaderboard';

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="animate-fade-in">
      <nav className="navbar">
        <div className="nav-brand">
          <BookOpen size={22} />
          ND IT 1.1 Portal
        </div>
        <div className="user-profile">
          <span className="user-name">{user?.displayName?.split(' ')[0]}</span>
          <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=4f46e5&color=fff`} alt="Profile" className="avatar" />
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-layout container">
        {/* Left - Modules grid */}
        <div className="modules-section">
          <div className="section-header">
            <h2>Your Modules</h2>
            <p className="text-muted">Select a module to begin quizzing</p>
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

        {/* Right - Leaderboard */}
        <div className="sidebar-section">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
