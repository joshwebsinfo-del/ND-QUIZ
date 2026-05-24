import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  indigo: {
    name: 'Indigo',
    primary: '#4338ca',
    primaryLight: '#6366f1',
    primaryGlow: 'rgba(99,102,241,0.25)',
    secondary: '#10b981',
  },
  ocean: {
    name: 'Ocean',
    primary: '#0369a1',
    primaryLight: '#0ea5e9',
    primaryGlow: 'rgba(14,165,233,0.25)',
    secondary: '#06b6d4',
  },
  sunset: {
    name: 'Sunset',
    primary: '#d97706',
    primaryLight: '#f59e0b',
    primaryGlow: 'rgba(245,158,11,0.25)',
    secondary: '#ec4899',
  },
  forest: {
    name: 'Forest',
    primary: '#059669',
    primaryLight: '#10b981',
    primaryGlow: 'rgba(16,185,129,0.25)',
    secondary: '#14b8a6',
  },
  purple: {
    name: 'Purple',
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    primaryGlow: 'rgba(167,139,250,0.25)',
    secondary: '#db2777',
  },
  rose: {
    name: 'Rose',
    primary: '#e11d48',
    primaryLight: '#f43f5e',
    primaryGlow: 'rgba(244,63,94,0.25)',
    secondary: '#0891b2',
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('indigo');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('quiz_theme');
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = THEMES[currentTheme];
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--primary-light', theme.primaryLight);
    document.documentElement.style.setProperty('--primary-glow', theme.primaryGlow);
    document.documentElement.style.setProperty('--secondary', theme.secondary);
    
    // Save to localStorage
    localStorage.setItem('quiz_theme', currentTheme);
  }, [currentTheme]);

  const switchTheme = (themeName) => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, switchTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
