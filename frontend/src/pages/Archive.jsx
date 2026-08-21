import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const Archive = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const res = await API.get('/posts/my-archive');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchArchive();
    }
  }, [user]);

  const handleToggleArchivePost = async (postId) => {
    try {
      await API.patch(`/posts/${postId}/archive`);
      fetchArchive();
    } catch (err) {
      alert('Failed to restore post');
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', margin: '3rem auto', maxWidth: '500px' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Sign In Required</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please sign in to access your personal blog archive.
        </p>
        <Link to="/auth" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', paddingBottom: '4rem' }}>
      <div className="glass-card" style={{ padding: '2rem 2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '2rem' }}>📂</div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Archived Blogs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              All archived posts are stored in reverse chronological order and are kept private to your account.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          Loading your archived posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Archived Blogs</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You haven't archived any blog posts yet. You can archive posts at any time from your blog editor or post card.
          </p>
          <Link to="/" className="btn btn-primary">Explore Published Blogs</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={true}
              onToggleArchive={handleToggleArchivePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Archive;
