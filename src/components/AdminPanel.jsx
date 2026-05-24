import React from 'react';
import { supabase } from '../supabase';

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

  return (
    <div className="admin-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2>Admin Panel</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>View user performance, leaderboards, and recent quiz activity.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading performance data...</p>
      ) : error ? (
        <div style={{ padding: '1rem', background: '#fde2e2', borderRadius: '1rem', color: '#b91c1c' }}>{error}</div>
      ) : (
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Best Score</th>
              <th>Quiz</th>
              <th>Completed</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;
