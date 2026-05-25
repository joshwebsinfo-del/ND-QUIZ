import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '1rem', fontStyle: 'italic', color: '#64748b' }}>
      <div style={{ marginBottom: '0.5rem' }}>JOSHWEBS</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/about" style={{ color: '#64748b', textDecoration: 'underline' }}>About Us</Link>
        <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'underline' }}>Privacy Policy</Link>
      </div>
    </footer>
  );
};

export default Footer;
