import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/posts/${id}`);
        setPost(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this blog post?')) {
      try {
        await API.delete(`/posts/${id}`);
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting post');
      }
    }
  };

  const handleToggleArchive = async () => {
    try {
      const res = await API.patch(`/posts/${id}/archive`);
      setPost({ ...post, isArchived: res.data.isArchived });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle archive state');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        Loading blog article...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', margin: '3rem auto', maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Post Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'This post may have been removed or is private.'}</p>
        <Link to="/" className="btn btn-primary">Back to Feed</Link>
      </div>
    );
  }

  const isOwner = user && (user.id === post.userId || user._id === post.userId);
  const authorName = post.User ? post.User.name : 'Unknown Author';
  const authorUsername = post.User ? post.User.username : 'user';
  const authorAvatar = post.User?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=6366f1&color=fff`;

  let tags = [];
  try {
    tags = JSON.parse(post.tags || '[]');
  } catch (e) {
    tags = [];
  }

  return (
    <div style={{ maxWidth: '840px', margin: '2rem auto', paddingBottom: '4rem' }}>
      {/* Post Main Card */}
      <article className="glass-card animate-fade" style={{ overflow: 'hidden' }}>
        {/* Cover Image Banner */}
        {post.coverImage && (
          <div style={{ height: '360px', width: '100%', overflow: 'hidden' }}>
            <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ padding: '2.5rem 2rem' }}>
          {/* Category & Status Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="category-pill">{post.category || 'General'}</span>
            {post.isArchived && <span className="archive-badge">Archived</span>}
            {!post.allowComments && <span className="archive-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>Comments Disabled</span>}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            {post.title}
          </h1>

          {/* Author Header Bar */}
          <div
            style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <Link to={`/profile/${authorUsername}`} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'inherit' }}>
              <img src={authorAvatar} alt={authorName} style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{authorName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>@{authorUsername}</div>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Published {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>

              {isOwner && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleToggleArchive} className="btn btn-secondary btn-sm" title={post.isArchived ? "Restore to Public Feed" : "Move to Archive"}>
                    {post.isArchived ? '📂 Restore' : '📦 Archive'}
                  </button>
                  <Link to={`/edit-post/${post.id}`} className="btn btn-secondary btn-sm">
                    ✏️ Edit
                  </Link>
                  <button onClick={handleDelete} className="btn btn-danger btn-sm">
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Body Content */}
          <div
            style={{
              fontSize: '1.12rem',
              lineHeight: 1.85,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              marginBottom: '2.5rem'
            }}
          >
            {post.content}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', pt: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tags:</span>
              {tags.map((t, idx) => (
                <span key={idx} className="tag-chip">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Comment Section */}
      <CommentSection
        postId={post.id}
        postOwnerId={post.userId}
        allowComments={post.allowComments}
        initialComments={post.Comments || []}
      />
    </div>
  );
};

export default SinglePost;
