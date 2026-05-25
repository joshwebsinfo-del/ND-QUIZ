import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem', borderRadius: '1rem', background: 'var(--bg-card)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
        <h1>About Us</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          This app was created by <strong>joshuamujakari</strong> to help learners access quizzes and module walkthroughs in one place.
        </p>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          If you need support or want to get in touch, contact <strong>0789932832</strong>.
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <h2>What we do</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            We provide module-based quizzes, progress tracking, and admin-assigned video tutorials so learners can study faster and track their improvement.
          </p>
        </div>
      </div>
    </div>
  );
}
