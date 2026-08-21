import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LandingHero from '../components/LandingHero';
import PostCard from '../components/PostCard';
import Auth from './Auth';

const ALL_CATEGORIES = ['Technology', 'Coding', 'AI', 'Design', 'Lifestyle', 'Finance', 'General'];
const TRENDING_TAGS = ['ai', 'coding', 'webdev', 'design', 'react', 'tech', 'future', 'javascript', 'python', 'architecture', 'startups'];

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('hasSeenSplash');
  });

  const [activeTab, setActiveTab] = useState('for-you'); // 'for-you' | 'following' | 'trending'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [posts, setPosts] = useState([]);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleFinishSplash = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (activeTab === 'for-you') {
        const res = await API.get('/posts/recommendations');
        setPosts(res.data);
      } else if (activeTab === 'following') {
        const res = await API.get('/posts/following');
        setPosts(res.data);
      } else { // 'trending'
        let url = `/posts?category=${encodeURIComponent(selectedCategory)}`;
        if (selectedTag) {
          url += `&tag=${encodeURIComponent(selectedTag)}`;
        }
        const res = await API.get(url);
        setPosts(res.data);
      }
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarksCount = async () => {
    try {
      const res = await API.get('/posts/bookmarked');
      setBookmarksCount(res.data.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!showSplash && user) {
      fetchPosts();
      fetchBookmarksCount();
    }
  }, [showSplash, activeTab, selectedCategory, selectedTag, user]);

  const handleToggleBookmark = async (postId) => {
    try {
      await API.post(`/posts/${postId}/bookmark`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p));
      fetchBookmarksCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // 1. Minimal Animated Logo Splash Intro Screen
  if (showSplash) {
    return <LandingHero onEnterWebsite={handleFinishSplash} />;
  }

  // 2. Unauthenticated Guests: Show ONLY Sign-In / Login Form
  if (!user) {
    return (
      <div style={{ maxWidth: '460px', margin: '3rem auto' }}>
        <Auth />
      </div>
    );
  }

  // 3. Authenticated Users: Twitter (X) 3-Column Layout
  return (
    <div className="twitter-layout">
      {/* COLUMN 1: LEFT SIDEBAR (Twitter Navigation & Full User Profile Card) */}
      <aside className="left-sidebar-sticky animate-fade">
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
          <div className="nav-logo-badge">B</div>
          <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 900 }}>Bloggora</span>
        </div>

        {/* User Profile Card Widget */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0284c7&color=ffffff`}
            alt={user.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', marginBottom: '0.6rem' }}
          />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{user.name}</h3>
          <span style={{ color: 'var(--accent-primary)', fontSize: '0.88rem', fontWeight: 700 }}>
            @{user.username}
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.85rem' }}>
            <div className="user-stat-badge">
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {bookmarksCount}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Bookmarks
              </span>
            </div>
            <div className="user-stat-badge">
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                {user.isPrivate ? '🔒 Private' : '🌐 Public'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Privacy
              </span>
            </div>
          </div>
        </div>

        {/* Left Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <Link to="/" className="left-nav-item active">
            <span>🏠</span> Home Feed
          </Link>
          <Link to="/bookmarks" className="left-nav-item">
            <span>🔖</span> Saved Bookmarks ({bookmarksCount})
          </Link>
          <Link to="/create-post" className="left-nav-item">
            <span>✍️</span> Write Blog Post
          </Link>
          <Link to="/archive" className="left-nav-item">
            <span>📁</span> My Archive
          </Link>
          <Link to={`/profile/${user.username}`} className="left-nav-item">
            <span>👤</span> Profile Settings
          </Link>
        </nav>

        {/* Write Button CTA */}
        <Link to="/create-post" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}>
          ✍️ Post a Blog
        </Link>

        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.2rem', color: '#ef4444' }}>
          Sign Out
        </button>
      </aside>

      {/* COLUMN 2: CENTER FEED (Sticky Tabs & Main Post Stream) */}
      <main style={{ minWidth: 0 }}>
        {/* Sticky Header 3 Tabs: For You, Following, Trending */}
        <div className="x-feed-header animate-fade">
          <button
            className={`x-feed-tab ${activeTab === 'for-you' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('for-you');
              setSelectedCategory('All');
              setSelectedTag('');
            }}
          >
            ✨ For You
          </button>

          <button
            className={`x-feed-tab ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('following');
              setSelectedCategory('All');
              setSelectedTag('');
            }}
          >
            👥 Following
          </button>

          <button
            className={`x-feed-tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            🔥 Trending
          </button>
        </div>

        {/* Active Filter Indicator Header */}
        {(selectedCategory !== 'All' || selectedTag) && (
          <div className="glass-card animate-fade" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Filter: {selectedCategory !== 'All' ? `Category: ${selectedCategory}` : `Hashtag: #${selectedTag}`}
            </span>
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedTag(''); }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
            >
              Clear Filter ✕
            </button>
          </div>
        )}

        {/* Posts Stream */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            Fetching blogs...
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card animate-fade" style={{ textAlign: 'center', padding: '4rem 2rem', margin: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              {activeTab === 'following' ? 'No Posts From Followed Creators' : 'No Blogs Found'}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {activeTab === 'following'
                ? 'Follow authors on Bloggora to see their published stories in your Following stream!'
                : 'Be the first creator to share a story in this section!'}
            </p>
            <Link to="/create-post" className="btn btn-primary">
              Write a Blog Post
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        )}
      </main>

      {/* COLUMN 3: RIGHT SIDEBAR (Trending Hashtags & Vertical Topics List) */}
      <aside className="right-sidebar-sticky animate-fade">
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <span>🔥</span> Trending Hashtags
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {TRENDING_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setActiveTab('trending');
                  setSelectedTag(t);
                  setSelectedCategory('All');
                }}
                className={`tag-chip ${selectedTag === t ? 'active' : ''}`}
                style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>#{t}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Trending</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <span>📁</span> Vertical Topics
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab('trending');
                  setSelectedCategory(cat);
                  setSelectedTag('');
                }}
                className={`tag-chip ${selectedCategory === cat ? 'active' : ''}`}
                style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>📁 {cat}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Topic</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Home;
