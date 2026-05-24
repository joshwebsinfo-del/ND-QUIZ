import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { currentTheme, switchTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn-icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Change theme"
        style={{ 
          background: 'var(--primary-glow)',
          color: 'var(--primary)',
          border: '1.5px solid var(--primary)',
        }}
      >
        <Palette size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1000,
            minWidth: '200px',
            animation: 'slideUp 0.2s ease both',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
              Themes
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {Object.entries(THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  switchTheme(key);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: currentTheme === key ? 'var(--primary-glow)' : 'var(--bg-sidebar)',
                  border: currentTheme === key ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: currentTheme === key ? 'var(--primary)' : 'var(--text-main)',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: theme.primary,
                  }}
                />
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
