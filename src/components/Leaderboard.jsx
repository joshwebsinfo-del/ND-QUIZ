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
            <div className="lb-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <div className="lb-row lb-row-head" style={{ display: 'grid', gridTemplateColumns: '40px 2fr 80px 70px 70px 70px', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <div>#</div>
                <div>Player</div>
                <div>Best %</div>
                <div>Quizzes</div>
                <div>Latest</div>
                <div>Played</div>
              </div>
              {mod.rows.map((row, index) => (
                <div key={`${mod.module_id}-${row.user_id || row.email}-${index}`} className="lb-row" style={{ display: 'grid', gridTemplateColumns: '40px 2fr 80px 70px 70px 70px', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                  <div style={{ fontWeight: 700 }}>{index + 1}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={row.avatar_url} alt={row.display_name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{row.display_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.latest_quiz_title || 'Quiz'}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{row.best_percentage}%</div>
                  <div>{row.quizzes_completed}</div>
                  <div>{row.latest_percentage}%</div>
                  <div>{formatDate(row.latest_played)}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
