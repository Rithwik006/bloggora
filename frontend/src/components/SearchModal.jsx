import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('blogs'); // 'blogs' | 'users'
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setBlogs([]);
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (activeTab === 'blogs') {
          const res = await API.get(`/posts?search=${encodeURIComponent(query)}`);
          setBlogs(res.data);
        } else {
          const res = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
          setUsers(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(8, 12, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '5vh'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade"
        style={{
          width: '100%',
          maxWidth: '680px',
          margin: '0 1rem',
          padding: '1.5rem',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          border: '1px solid var(--border-active)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder={activeTab === 'blogs' ? "Search blogs by title, keywords, categories, or tags..." : "Search users by name or @username..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{ fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)' }}
          />
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.6rem 0.9rem' }}>
            Esc
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', pb: '0.75rem', marginBottom: '1rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'blogs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('blogs')}
          >
            📝 Blogs
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Authors & Users
          </button>
        </div>

        {/* Results Container */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Searching live platform data...
            </div>
          )}

          {!loading && query.trim() && activeTab === 'blogs' && blogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No blogs found matching "{query}"
            </div>
          )}

          {!loading && query.trim() && activeTab === 'users' && users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No users found matching "{query}"
            </div>
          )}

          {/* Blogs List */}
          {!loading && activeTab === 'blogs' && blogs.map((b) => (
            <Link
              key={b.id}
              to={`/posts/${b.id}`}
              onClick={onClose}
              style={{
                display: 'block',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                marginBottom: '0.75rem',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{b.title}</h4>
                <span className="category-pill">{b.category || 'General'}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.4rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {b.content}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>By @{b.User?.username || 'author'}</span>
                <span>•</span>
                <span>{new Date(b.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </Link>
          ))}

          {/* Users List */}
          {!loading && activeTab === 'users' && users.map((u) => (
            <Link
              key={u.id}
              to={`/profile/${u.username}`}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                marginBottom: '0.75rem',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <img
                src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                alt={u.name}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{u.name}</h4>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>@{u.username}</span>
                  {u.isPrivate && <span className="archive-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Private</span>}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.bio || 'No bio available'}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
