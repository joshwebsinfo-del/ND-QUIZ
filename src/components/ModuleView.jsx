import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, Lock, CheckCircle, Clock, ArrowLeft, Star } from 'lucide-react';
import { modulesData, getAllQuizzes } from '../data/modules';
import { getProgress } from '../utils/progress';
import { getTutorialsForModuleFromSupabase } from '../supabase';

export default function ModuleView({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const moduleInfo = modulesData.find(m => m.id === moduleId);
  if (!moduleInfo) return <div className="container mt-8">Module not found.</div>;

  const allQuizzes = getAllQuizzes();
  const moduleQuizzes = moduleInfo.quizzes.map(id => allQuizzes.find(q => q.id === id)).filter(Boolean);
  const userId = user?.id || user?.uid;
  const progress = getProgress(userId);
  const [moduleTutorials, setModuleTutorials] = useState([]);

  useEffect(() => {
    let isActive = true;
    const loadTutorials = async () => {
      const tutorials = await getTutorialsForModuleFromSupabase(moduleId);
      if (isActive) setModuleTutorials(tutorials);
    };

    loadTutorials();
    return () => {
      isActive = false;
    };
  }, [moduleId]);

  const scrollToTutorials = () => {
    const element = document.getElementById('module-tutorials');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="module-view-page animate-fade-in">
      {/* Header */}
      <div className="module-view-header" style={{ '--module-color': moduleInfo.color }}>
        <div className="container">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} /> All Modules
          </button>
          <div className="module-view-title">
            <span className="module-view-emoji">{moduleInfo.icon}</span>
            <div>
              <h2>{moduleInfo.title}</h2>
              <p>{moduleInfo.code} · {moduleQuizzes.length} Learning Outcomes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {moduleTutorials.length > 0 && (
          <section id="module-tutorials" className="module-tutorials-section" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0' }}>Module tutorials</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Watch the admin-assigned walkthroughs for this module without leaving the app.</p>
              </div>
            </div>
            <div className="tutorial-grid">
              {moduleTutorials.map((tutorial) => {
                const quiz = allQuizzes.find((q) => q.id === tutorial.quizId);
                return (
                  <div key={tutorial.quizId} className="tutorial-card">
                    <div className="tutorial-card-header">
                      <div>
                        <strong>{quiz?.title || 'Tutorial topic'}</strong>
                        <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{moduleInfo.title}</div>
                      </div>
                    </div>
                    <div className="tutorial-embed">
                      <iframe
                        src={tutorial.videoEmbedUrl}
                        title={quiz?.title || 'Module tutorial'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="lo-grid">
          {moduleQuizzes.map((quiz, index) => {
            const isLocked = index > 0 && !progress[moduleQuizzes[index - 1].id]?.passed;
            const qProgress = progress[quiz.id];
            const pct = qProgress ? Math.round(qProgress.percentage) : null;
            const quizTutorial = moduleTutorials.find((item) => item.quizId === quiz.id);

            return (
              <div
                key={quiz.id}
                className={`lo-card animate-fade-in ${isLocked ? 'lo-locked' : ''} ${qProgress?.passed ? 'lo-passed' : ''}`}
                style={{ animationDelay: `${index * 0.06}s`, '--module-color': moduleInfo.color }}
              >
                {/* LO number badge */}
                <div className="lo-number" style={{ background: isLocked ? 'var(--border-color)' : moduleInfo.color }}>
                  {isLocked ? <Lock size={14} /> : `LO${index + 1}`}
                </div>

                <div className="lo-content">
                  <h3 className="lo-title">{quiz.title}</h3>
                  <p className="lo-desc">{quiz.description}</p>

                  <div className="lo-meta">
                    <span className="lo-time"><Clock size={13} /> {quiz.timeLimitMinutes} min</span>
                    <span className="lo-questions">20 questions</span>
                  </div>

                  {/* Progress bar if attempted */}
                  {qProgress && (
                    <div className="lo-progress-wrap">
                      <div className="lo-progress-bar-bg">
                        <div
                          className="lo-progress-bar-fill"
                          style={{ width: `${pct}%`, background: qProgress.passed ? '#10b981' : '#ef4444' }}
                        />
                      </div>
                      <div className="lo-score-row">
                        <span style={{ color: qProgress.passed ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                          Best: {qProgress.score}/20 ({pct}%)
                          {qProgress.passed && <CheckCircle size={12} style={{ display: 'inline', marginLeft: 4 }} />}
                        </span>
                        {qProgress.passed && (
                          <span className="lo-stars">
                            {[...Array(Math.ceil(pct / 33.3))].map((_, i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {quizTutorial && (
                    <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }} onClick={scrollToTutorials}>
                      Watch tutorial for this topic
                    </button>
                  )}
                </div>

                <button
                  className={`lo-btn ${isLocked ? 'lo-btn-locked' : 'lo-btn-start'}`}
                  style={{ '--module-color': moduleInfo.color }}
                  onClick={() => !isLocked && navigate(`/quiz/${quiz.id}`)}
                  disabled={isLocked}
                >
                  {isLocked ? (
                    <><Lock size={16} /> Locked</>
                  ) : (
                    <><PlayCircle size={16} /> {qProgress ? 'Retry' : 'Start'}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
