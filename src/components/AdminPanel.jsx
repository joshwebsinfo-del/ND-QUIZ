import React from 'react';
import { supabase, deleteScore, deleteUser, fetchProfiles } from '../supabase';

const AdminPanel = () => {
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('quiz_scores')
        .select('user_id, display_name, email, avatar_url, quiz_title, percentage, completed_at')
        .order('percentage', { ascending: false })
        .limit(50);

      if (queryError) {
        setError(queryError.message);
      } else {
        setLeaderboard(data || []);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const exportCSV = () => {
    if (!leaderboard || leaderboard.length === 0) { alert('No data to export'); return; }
    const rows = leaderboard.map(r => ({ name: r.display_name || '', email: r.email || '', percentage: r.percentage || 0, quiz: r.quiz_title || '', completed_at: r.completed_at || '' }));
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leaderboard.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const handleDeleteScore = async (row) => {
    if (!confirm(`Delete score for ${row.display_name} (${Number(row.percentage)||0}%)?`)) return;
    const criteria = { user_id: row.user_id, quiz_title: row.quiz_title, completed_at: row.completed_at };
    const res = await deleteScore(criteria);
    if (res.error) { alert('Delete failed: ' + (res.error.message || res.error)); return; }
    setLeaderboard(prev => prev.filter(p => !(p.user_id === row.user_id && p.quiz_title === row.quiz_title && p.completed_at === row.completed_at)));
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm(`Delete user ${userId} and all their data? This cannot be undone.`)) return;
    const res = await deleteUser(userId);
    if (res.error) { alert('Delete failed: ' + (res.error.message || res.error)); return; }
    setLeaderboard(prev => prev.filter(p => p.user_id !== userId));
  };

  return (
    <div className="admin-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="rainbow-text">Admin Panel</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>View user performance, leaderboards, and recent quiz activity.</p>
        </div>
        <div className="admin-status-badge" style={{ marginLeft: 'auto' }}>
          Admin All Rights
        </div>
      </div>

      {loading ? (
        <p>Loading performance data...</p>
      ) : error ? (
        <div style={{ padding: '1rem', background: '#fde2e2', borderRadius: '1rem', color: '#b91c1c' }}>{error}</div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>{leaderboard.length} entries</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={exportCSV}>Export CSV</button>
              <button className="btn btn-outline btn-sm" onClick={async () => { const p = await fetchProfiles(); alert('Profiles fetched: ' + p.length); }}>Fetch Profiles</button>
            </div>
          </div>

          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Best Score</th>
                <th>Quiz</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={`${row.user_id}-${row.quiz_title}-${row.completed_at}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td>{row.display_name || 'Unknown'}</td>
                  <td>{row.email || 'N/A'}</td>
                  <td>{Number(row.percentage).toFixed(0)}%</td>
                  <td>{row.quiz_title || 'Quiz'}</td>
                  <td>{new Date(row.completed_at).toLocaleString()}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={`mailto:${row.email}`} className="btn btn-outline btn-sm">Message</a>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDeleteScore(row)}>Delete Score</button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleDeleteUser(row.user_id)}>Delete User</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
