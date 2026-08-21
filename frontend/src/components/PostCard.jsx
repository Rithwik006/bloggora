import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post, isOwner, onToggleArchive, onToggleBookmark }) => {
  const [bookmarked, setBookmarked] = useState(Boolean(post.isBookmarked));

  let tags = [];
  try {
    tags = JSON.parse(post.tags || '[]');
  } catch (e) {
    tags = [];
  }

  const authorName = post.User ? post.User.name : 'Unknown';
  const authorUsername = post.User ? post.User.username : 'user';
  const authorAvatar = post.User?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=38bdf8&color=041225`;

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
    if (onToggleBookmark) {
      onToggleBookmark(post.id);
    }
  };

  return (
    <div
      className="glass-card animate-fade"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Optional Cover Image */}
      {post.coverImage && (
        <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative' }}>
          <img
            src={post.coverImage}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span className="category-pill">{post.category || 'General'}</span>
            <button
              onClick={handleBookmarkClick}
              title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
              style={{
                background: bookmarked ? 'var(--accent-secondary)' : 'rgba(8, 12, 20, 0.75)',
                color: bookmarked ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.9rem',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
            >
              {bookmarked ? '🔖' : '📑'}
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {!post.coverImage && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span className="category-pill">{post.category || 'General'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {post.isArchived && <span className="archive-badge">Archived</span>}
              <button
                onClick={handleBookmarkClick}
                title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
                style={{
                  background: bookmarked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                  color: bookmarked ? '#34d399' : 'var(--text-muted)',
                  border: bookmarked ? '1px solid var(--border-emerald)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.25rem 0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                {bookmarked ? '🔖 Saved' : '📑 Save'}
              </button>
            </div>
          </div>
        )}

        {post.coverImage && post.isArchived && (
          <div style={{ marginBottom: '0.8rem' }}>
            <span className="archive-badge">Archived</span>
          </div>
        )}

        <Link to={`/posts/${post.id}`} style={{ color: 'inherit' }}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '0.6rem',
              lineHeight: 1.35,
              color: 'var(--text-primary)',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          >
            {post.title}
          </h3>
        </Link>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            marginBottom: '1.2rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}
        >
          {post.content}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {tags.map((t, idx) => (
              <span key={idx} className="tag-chip">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer info: Author & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Link
            to={`/profile/${authorUsername}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'inherit' }}
          >
            <img
              src={authorAvatar}
              alt={authorName}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.1 }}>{authorName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{authorUsername}</div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            {isOwner && onToggleArchive && (
              <button
                onClick={() => onToggleArchive(post.id)}
                className="btn btn-secondary btn-sm"
                title={post.isArchived ? "Restore from Archive" : "Archive Post"}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              >
                {post.isArchived ? '📂 Restore' : '📦 Archive'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
