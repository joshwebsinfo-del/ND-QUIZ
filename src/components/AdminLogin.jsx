import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';

export default function AdminLogin({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Admin credentials
  const ADMIN_EMAIL = 'joshuamujakari15@gmail.com';
  const ADMIN_PASSWORD = 'joshua#$#$';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = {
        email: email,
        displayName: 'Admin',
        role: 'admin',
        isAdmin: true,
      };
      localStorage.setItem('quiz_user', JSON.stringify(adminUser));
      setUser(adminUser);
      navigate('/admin');
    } else {
      setError('Invalid admin credentials. Please check your email and password.');
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-blob login-blob-1"></div>
      <div className="login-blob login-blob-2"></div>
      <div className="login-blob login-blob-3"></div>

      <div className="login-card">
        <form className="login-form" onSubmit={handleLogin}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <LogIn size={28} color="var(--primary)" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Admin Portal</h2>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.9rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
            }}>
              <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: 500 }}>
                {error}
              </span>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '0.5rem',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'white',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '0.5rem',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'white',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 2px 12px rgba(67,56,202,0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 16px rgba(67,56,202,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 12px rgba(67,56,202,0.3)';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>

          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '1rem',
          }}>
            Admin access only. Unauthorized access is prohibited.
          </p>
        </form>
      </div>
    </div>
  );
}
