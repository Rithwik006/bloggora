import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const CommentSection = ({ postId, postOwnerId, allowComments, initialComments = [] }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.post(`/comments/${postId}`, { text });
      setComments([res.data, ...comments]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting comment');
    }
  };

  const isPostOwner = user && (user.id === postOwnerId || user._id === postOwnerId);

  return (
    <div className="glass-card animate-fade" style={{ padding: '2rem 1.75rem', marginTop: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', pb: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
          💬 Comments ({comments.length})
        </h3>
        {!allowComments && (
          <span className="archive-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
            Comments Disabled by Author
          </span>
        )}
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Add Comment Form */}
      {allowComments ? (
        user ? (
          <form onSubmit={handleAddComment} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                alt={user.name}
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', marginTop: '0.2rem' }}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Share your thoughts or feedback on this post..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Want to join the conversation? </span>
            <Link to="/auth" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              Sign in to leave a comment
            </Link>
          </div>
        )
      ) : (
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
          The author has turned off comments for this blog post.
        </div>
      )}

      {/* Comments List (Reverse Chronological) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {comments.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            No comments yet.
          </div>
        ) : (
          comments.map((c) => {
            const commentAuthorName = c.User ? c.User.name : 'User';
            const commentAuthorUsername = c.User ? c.User.username : 'user';
            const commentAuthorAvatar = c.User?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(commentAuthorName)}&background=6366f1&color=fff`;
            const isCommentAuthor = user && (user.id === c.userId || user._id === c.userId);
            const canDelete = isCommentAuthor || isPostOwner;

            return (
              <div
                key={c.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Link to={`/profile/${commentAuthorUsername}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'inherit' }}>
                    <img
                      src={commentAuthorAvatar}
                      alt={commentAuthorName}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{commentAuthorName}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>@{commentAuthorUsername}</span>
                    </div>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem' }}
                        title={isPostOwner ? "Delete comment (Author Moderation)" : "Delete your comment"}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.94rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {c.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
