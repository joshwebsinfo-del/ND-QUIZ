import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem', borderRadius: '1rem', background: 'var(--bg-card)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
        <h1>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          This app collects only the information required to personalize and store user progress, including quiz completion and profile information.
        </p>
        <h2>Information collected</h2>
        <ul style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <li>User profile information (name, email, avatar).</li>
          <li>Quiz progress and scores.</li>
          <li>Tutorial assignments saved by admins.</li>
        </ul>
        <h2>How we use your information</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          We use your information to provide quiz progress tracking, personalize your experience, sync tutorials across devices, and support administrative features.
        </p>
        <h2>Security</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          We take steps to keep your data secure, but please keep your login details private and only access the service from trusted devices.
        </p>
      </div>
    </div>
  );
}
