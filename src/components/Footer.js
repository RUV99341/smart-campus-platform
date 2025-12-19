import React from 'react';
import './FooterLinks.css';

const FooterLinks = () => {
  return (
    <footer className="footer-links">
      <div className="links">
        <a href="/about">About</a>
        <a href="/help">Help</a>
        <a href="/press">Press</a>
        <a href="/api">API</a>
        <a href="/jobs">Jobs</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/locations">Locations</a>
        <a href="/language">Language</a>
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} Smart Campus from Quantum
      </div>
    </footer>
  );
};

export default FooterLinks;
