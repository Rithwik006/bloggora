import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import PostCard from '../components/PostCard';

const Bookmarks = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/posts/bookmarked');
      setPosts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookmarked posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleToggleBookmark = async (postId) => {
    try {
      await API.post(`/posts/${postId}/bookmark`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bookmark');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', paddingBottom: '4rem' }}>
      <div className="glass-card animate-fade" style={{ padding: '2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>🔖</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Saved Bookmarks</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Manage and read stories you have saved for later.
          </p>
        </div>
        <span className="bookmark-badge">
          {posts.length} {posts.length === 1 ? 'Post' : 'Posts'} Saved
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          Loading your saved bookmarks...
        </div>
      ) : error ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', color: '#f87171' }}>
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card animate-fade" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Bookmarks Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            When you see a post you want to save, click the ribbon icon on the post card!
          </p>
          <Link to="/" className="btn btn-primary">Explore Feed</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
