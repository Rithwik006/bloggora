import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not logged in or on home page with left sidebar, hide top navbar to prevent duplication
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar-wrapper mobile-only-navbar">
      <nav className="floating-navbar">
        {/* Brand Logo */}
        <Link to="/" className="nav-logo-group">
          <div className="nav-logo-badge">B</div>
          <span className="gradient-text" style={{ fontWeight: 800 }}>Bloggora</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-secondary btn-sm"
        >
          {mobileMenuOpen ? '✕ Menu' : '☰ Menu'}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="glass-card animate-fade"
          style={{
            position: 'absolute',
            top: '4.5rem',
            left: '1rem',
            right: '1rem',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            zIndex: 1001,
            background: '#ffffff'
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-pill-item">
            🏠 Home Feed
          </Link>
          {onOpenSearch && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              🔍 Search Articles
            </button>
          )}
          <Link to="/bookmarks" onClick={() => setMobileMenuOpen(false)} className="nav-pill-item">
            🔖 Saved Bookmarks
          </Link>
          <Link to="/create-post" onClick={() => setMobileMenuOpen(false)} className="nav-pill-item">
            ✍️ Write New Article
          </Link>
          <Link to="/archive" onClick={() => setMobileMenuOpen(false)} className="nav-pill-item">
            📁 My Archived Posts
          </Link>
          <Link to={`/profile/${user.username}`} onClick={() => setMobileMenuOpen(false)} className="nav-pill-item">
            👤 My Profile (@{user.username})
          </Link>
          <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ width: '100%' }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
