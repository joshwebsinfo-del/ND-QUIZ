import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layers, RotateCcw, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveProgress } from '../utils/progress';
import { saveScoreToSupabase } from '../supabase';
import { modulesData } from '../data/modules';

export default function Results({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, quizId = null, quizTitle = '' } = location.state || {};
  const percentage = Math.round((score / total) * 100) || 0;
  const passed = percentage >= 70;

  useEffect(() => {
    if (quizId && user) {
      saveProgress(user.uid, quizId, score, total);
      saveScoreToSupabase(user, quizId, quizTitle, score, total);
    }
    if (passed) {
      setTimeout(() => {
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'] });
      }, 200);
    }
  }, []);

  const grade = percentage >= 90 ? { label: 'Distinction', color: '#f59e0b', emoji: '🏆' }
    : percentage >= 80 ? { label: 'Merit', color: '#4f46e5', emoji: '🥈' }
    : percentage >= 70 ? { label: 'Pass', color: '#10b981', emoji: '✅' }
    : { label: 'Not Yet', color: '#ef4444', emoji: '📚' };

  return (
    <div className="results-page animate-fade-in">
      <div className="results-card">
        <h2 className="results-title">Quiz Complete!</h2>
        <p className="results-quiz-name">{quizTitle}</p>

        {/* Circular score */}
        <div className="score-circle-wrap">
          <svg viewBox="0 0 120 120" className="score-ring">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-color)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={grade.color} strokeWidth="10"
              strokeDasharray={`${(percentage / 100) * 326} 326`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="score-inner">
            <span className="score-pct" style={{ color: grade.color }}>{percentage}%</span>
            <span className="score-frac">{score}/{total}</span>
          </div>
        </div>

        <div className="grade-badge" style={{ background: grade.color + '20', color: grade.color, border: `2px solid ${grade.color}` }}>
          {grade.emoji} {grade.label}
        </div>

        {passed
          ? <p className="results-msg pass">🎉 Excellent! The next quiz is now unlocked.</p>
          : <p className="results-msg fail">Score at least 70% to unlock the next quiz. Keep practising!</p>
        }

        <div className="results-actions">
          <button className="btn btn-outline" onClick={() => navigate(`/quiz/${quizId}`, { state: location.state })}>
            <RotateCcw size={18} /> Try Again
          </button>
          <button className="btn btn-primary" onClick={() => {
            const parentModule = modulesData.find(m => m.quizzes.includes(quizId));
            if (parentModule) {
              navigate(`/module/${parentModule.id}`);
            } else {
              navigate('/dashboard');
            }
          }}>
            <Layers size={18} /> Back to Module
          </button>
        </div>
      </div>
    </div>
  );
}
