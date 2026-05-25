import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, RefreshCw } from 'lucide-react';
import { fetchLeaderboard, subscribeToLeaderboard } from '../supabase';

export default function Leaderboard() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState(null);
  const channelRef = useRef(null);

  const formatDate = (iso) => {
    if (!iso) return '-';
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const load = async () => {
    setLoading(true);
    const data = await fetchLeaderboard();
    setModules(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();

    channelRef.current = subscribeToLeaderboard((entry) => {
      if (!entry) return;
      setNewEntry(entry);
      setTimeout(() => setNewEntry(null), 3000);
      load();
    });

    return () => {
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, []);

  return (
    <div className="leaderboard-panel">
      <div className="leaderboard-header">
        <Trophy size={20} color="#f59e0b" />
        <div>
          <h3>Module League Table</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Shared leaderboard across all learners, grouped by module.
          </p>
        </div>
        <button className="lb-refresh" onClick={load} title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {newEntry && (
        <div className="lb-live-toast animate-slide-in">
          <Zap size={14} color="#f59e0b" />
          <span>
            <strong>{newEntry.display_name || 'A student'}</strong> just scored {Number(newEntry.percentage) || 0}% on {newEntry.quiz_title || 'a quiz'}!
          </span>
        </div>
      )}

      {loading ? (
        <div className="lb-loading">
          <div className="lb-skeleton" />
          <div className="lb-skeleton" />
          <div className="lb-skeleton" />
        </div>
      ) : modules.filter((mod) => mod.rows && mod.rows.length > 0).length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
          No leaderboard data yet. Finish a quiz to generate rankings.
        </p>
      ) : (
        modules.filter((mod) => mod.rows && mod.rows.length > 0).map((mod) => (
          <div key={mod.module_id} className="lb-module-card" style={{ marginBottom: '1rem' }}>
            <div className="lb-module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0 }}>{mod.module_title}</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{mod.rows.length} leaders</p>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>League-style ranking</div>
            </div>
            <div className="lb-table">
              <div className="lb-row lb-row-head">
                <div>#</div>
                <div>Player</div>
                <div>Best %</div>
                <div className="lb-hidden-sm">Quizzes</div>
                <div className="lb-hidden-sm">Latest</div>
                <div className="lb-hidden-sm">Played</div>
              </div>
              {mod.rows.map((row, index) => (
                <div key={`${mod.module_id}-${row.user_id || row.email}-${index}`} className="lb-row">
                  <div className="lb-rank" style={{ fontWeight: 700 }}>{index + 1}</div>
                  <div className="lb-player">
                    <img src={row.avatar_url} alt={row.display_name} className="lb-avatar" />
                    <div>
                      <div className="lb-name">{row.display_name}</div>
                      <div className="lb-quiz">{row.latest_quiz_title || 'Quiz'}</div>
                    </div>
                  </div>
                  <div className="lb-best" style={{ fontWeight: 700 }}>{row.best_percentage}%</div>
                  <div className="lb-hidden-sm">{row.quizzes_completed}</div>
                  <div className="lb-hidden-sm">{row.latest_percentage}%</div>
                  <div className="lb-hidden-sm">{formatDate(row.latest_played)}</div>
                  <div className="lb-mobile-meta">
                    <span>{row.quizzes_completed} quizzes</span>
                    <span>{row.latest_percentage}% latest</span>
                    <span>{formatDate(row.latest_played)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
