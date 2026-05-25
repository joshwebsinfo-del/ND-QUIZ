import React from 'react';
import {
  supabase,
  deleteScore,
  deleteUser,
  fetchProfiles,
  getTutorialsFromSupabase,
  saveTutorialToSupabase,
  deleteTutorialFromSupabase,
} from '../supabase';
import { modulesData, getAllQuizzes } from '../data/modules';
import { getYouTubeEmbedUrl } from '../utils/tutorials';

const AdminPanel = () => {
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [moduleId, setModuleId] = React.useState(modulesData[0]?.id || '');
  const [quizId, setQuizId] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [tutorials, setTutorials] = React.useState([]);
  const [saving, setSaving] = React.useState(false);

  const allQuizzes = getAllQuizzes();
  const currentModule = modulesData.find((mod) => mod.id === moduleId) || modulesData[0];
  const moduleQuizzes = currentModule?.quizzes
    .map((id) => allQuizzes.find((q) => q.id === id))
    .filter(Boolean);

  React.useEffect(() => {
    if (moduleQuizzes.length > 0 && !moduleQuizzes.find((q) => q.id === quizId)) {
      setQuizId(moduleQuizzes[0]?.id || '');
    }
  }, [moduleId, moduleQuizzes, quizId]);

  const loadTutorials = async () => {
    const tutorials = await getTutorialsFromSupabase();
    setTutorials(tutorials);
  };

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
    loadTutorials();
  }, []);

  const refreshTutorials = async () => {
    await loadTutorials();
  };

  const exportCSV = () => {
    if (!leaderboard || leaderboard.length === 0) { alert('No data to export'); return; }
    const rows = leaderboard.map(r => ({ name: r.display_name || '', email: r.email || '', percentage: r.percentage || 0, quiz: r.quiz_title || '', completed_at: r.completed_at || '' }));
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leaderboard.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const handleSaveTutorial = async () => {
    if (!moduleId || !quizId || !videoUrl.trim()) {
      alert('Please choose a module, topic, and paste a YouTube tutorial link.');
      return;
    }

    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    if (!embedUrl) {
      alert('Please provide a valid YouTube link.');
      return;
    }

    setSaving(true);
    await saveTutorialToSupabase({ moduleId, quizId, sourceUrl: videoUrl.trim(), videoEmbedUrl: embedUrl });
    await refreshTutorials();
    setSaving(false);
    setVideoUrl('');
    alert('Tutorial saved. It will now appear for users on that module.');
  };

  const handleRemoveTutorial = async (entry) => {
    if (!confirm('Remove tutorial for this topic?')) return;
    await deleteTutorialFromSupabase(entry.moduleId, entry.quizId);
    await refreshTutorials();
  };

  const renderTutorialList = () => {
    if (tutorials.length === 0) {
      return <p style={{ color: 'var(--text-muted)' }}>No tutorials have been added yet.</p>;
    }

    return (
      <div className="admin-tutorial-list">
        {tutorials.map((entry) => {
          const module = modulesData.find((mod) => mod.id === entry.moduleId);
          const quiz = allQuizzes.find((q) => q.id === entry.quizId);
          return (
            <div key={`${entry.moduleId}-${entry.quizId}`} className="admin-tutorial-item">
              <div>
                <strong>{module?.title || entry.moduleId}</strong>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Topic: {quiz?.title || entry.quizId}
                </div>
                <a href={entry.sourceUrl} target="_blank" rel="noreferrer" className="link-secondary">View source link</a>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => handleRemoveTutorial(entry)}>Remove</button>
            </div>
          );
        })}
      </div>
    );
  };

  const handleModuleChange = (event) => {
    setModuleId(event.target.value);
    const nextModule = modulesData.find((m) => m.id === event.target.value);
    if (nextModule?.quizzes?.length > 0) {
      setQuizId(nextModule.quizzes[0]);
    } else {
      setQuizId('');
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2 className="rainbow-text">Admin Panel</h2>
          <p className="admin-panel-description">View user performance, leaderboards, and tutorial assignments for each module.</p>
        </div>
        <div className="admin-status-badge">
          Admin All Rights
        </div>
      </div>

      <section className="admin-tutorial-section">
        <div className="admin-tutorial-top">
          <div className="admin-tutorial-info">
            <h3>Module tutorial manager</h3>
            <p>Choose a module and topic, add a YouTube link, and users will see the tutorial inside the module page.</p>
          </div>
          <div className="admin-form-grid">
            <label>
              <span>Module</span>
              <select className="input-field" value={moduleId} onChange={handleModuleChange}>
                {modulesData.map((mod) => (
                  <option key={mod.id} value={mod.id}>{mod.title}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Topic</span>
              <select className="input-field" value={quizId} onChange={(e) => setQuizId(e.target.value)}>
                {moduleQuizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                ))}
              </select>
            </label>
            <label>
              <span>YouTube tutorial link</span>
              <input
                className="input-field"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </label>
            <button className="btn btn-primary btn-sm" onClick={handleSaveTutorial} disabled={saving}>
              {saving ? 'Saving...' : 'Save tutorial'}
            </button>
          </div>
        </div>

        <div className="admin-tutorial-results">
          <h4>Assigned tutorials</h4>
          {renderTutorialList()}
        </div>
      </section>

      {loading ? (
        <p>Loading performance data...</p>
      ) : error ? (
        <div style={{ padding: '1rem', background: '#fde2e2', borderRadius: '1rem', color: '#b91c1c' }}>{error}</div>
      ) : (
        <div>
          <div className="admin-table-header">
            <div className="admin-table-meta">{leaderboard.length} entries</div>
            <div className="admin-table-actions">
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
