import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import defaultProfile from '../assets/defaultProfile.svg';
import './navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut: contextSignOut } = useAuth();
  const [role, setRole] = useState(user?.role || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await contextSignOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchRole() {
      if (!user || user.role) return;
      try {
        const uDoc = await getDoc(doc(db, 'users', user.uid));
        if (mounted && uDoc.exists()) {
          const data = uDoc.data();
          setRole(data.role || '');
        }
      } catch (err) {
        console.error('Failed to fetch user role', err);
      }
    }
    fetchRole();
    return () => { mounted = false; };
  }, [user]);

  return (
    <nav className="scp-navbar">
      <div className="scp-container">
        <div className="scp-brand" onClick={() => navigate('/home')} role="button">
          Smart Campus
        </div>

        <div className="scp-right">
          <div className="scp-links">
            <Link to="/submit" className="scp-link">Submit Complaint</Link>
            <Link to="/feed" className="scp-link">Complaint Feed</Link>
            { (user?.role === 'admin' || role === 'admin') && (
              <Link to="/admin-dashboard" className="scp-link">Admin Dashboard</Link>
            )}
          </div>

            <div className="scp-profile" ref={dropdownRef}>
              <div
                className="scp-profile-btn"
                onClick={toggleDropdown}
                role="button"
                tabIndex={0}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDropdown(); } }}
              >
                <span className="scp-profile-name">{user?.name || user?.displayName || 'Profile'}</span>
                <img
                  src={user?.avatar || user?.photoURL || defaultProfile}
                  alt="Profile"
                  className="scp-profile-img"
                />
              </div>

            {dropdownOpen && (
              <div className="scp-dropdown">
                <p className="scp-user-name">{user?.name || user?.displayName || 'User'}</p>
                <Link to="/profile" className="scp-dropdown-link" onClick={() => setDropdownOpen(false)}>View Profile</Link>
                <button className="scp-logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};



export default Navbar;
