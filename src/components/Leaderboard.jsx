import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Medal, RefreshCw } from 'lucide-react';
import { fetchLeaderboard, subscribeToLeaderboard } from '../supabase';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState(null);
  const channelRef = useRef(null);

  const normalizeLeaderboard = (data) => {
    const items = (data || []).map((row) => ({
      ...row,
      percentage: Number(row.percentage) || 0,
      display_name: row.display_name || row.email || 'Student',
      avatar_url: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.display_name || 'Student')}&background=4f46e5&color=fff`,
      quiz_title: row.quiz_title || 'Quiz attempt',
    }));

    return Object.values(
      items.reduce((acc, row) => {
        const key = row.user_id || row.email || row.display_name;
        if (!acc[key] || row.percentage > acc[key].percentage) {
          acc[key] = row;
        }
        return acc;
      }, {})
    )
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 50);
  };

  const load = async () => {
    const data = await fetchLeaderboard();
    setScores(normalizeLeaderboard(data));
    setLoading(false);
  };

  useEffect(() => {
    load();

    channelRef.current = subscribeToLeaderboard((payload) => {
      const entry = payload.new || payload.record || payload?.event?.data?.new;
      if (!entry) return;
      setNewEntry(entry);
      setTimeout(() => setNewEntry(null), 3000);
      setScores((prev) => normalizeLeaderboard([entry, ...prev]));
    });

    return () => {
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, []);

  const medalColor = (i) => {
    if (i === 0) return '#f59e0b';
    if (i === 1) return '#94a3b8';
    if (i === 2) return '#b45309';
    return 'var(--text-muted)';
  };

  return (
    <div className="leaderboard-panel">
      <div className="leaderboard-header">
        <Trophy size={20} color="#f59e0b" />
        <h3>Live Leaderboard</h3>
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
      ) : scores.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
          No scores yet. Be the first! 🏆
        </p>
      ) : (
        <ul className="lb-list">
          {scores.map((s, i) => (
            <li key={`${s.user_id || s.display_name}-${i}`} className="lb-item animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              <span className="lb-rank" style={{ color: medalColor(i) }}>
                {i < 3 ? <Medal size={16} /> : `#${i + 1}`}
              </span>
              <img
                src={s.avatar_url}
                alt={s.display_name}
                className="lb-avatar"
              />
              <div className="lb-info">
                <span className="lb-name">{s.display_name}</span>
                <span className="lb-quiz">{s.quiz_title.replace('LO', 'L').slice(0, 28)}</span>
              </div>
              <div className="lb-score-pill" style={{ background: s.percentage >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.percentage >= 70 ? 'var(--secondary)' : 'var(--danger)' }}>
                {s.percentage}%
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
