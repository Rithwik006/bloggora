import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';

const CATEGORIES = ['Technology', 'Coding', 'AI', 'Design', 'Lifestyle', 'Finance', 'General'];

const CreateEditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    coverImage: '',
    category: 'Technology',
    tags: '',
    allowComments: true,
    isArchived: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const { data } = await API.get(`/posts/${id}`);
          let parsedTags = '';
          try {
            const arr = JSON.parse(data.tags || '[]');
            parsedTags = Array.isArray(arr) ? arr.join(', ') : data.tags;
          } catch (e) {
            parsedTags = data.tags || '';
          }

          setFormData({
            title: data.title || '',
            content: data.content || '',
            coverImage: data.coverImage || '',
            category: data.category || 'Technology',
            tags: parsedTags,
            allowComments: data.allowComments !== undefined ? data.allowComments : true,
            isArchived: Boolean(data.isArchived)
          });
        } catch (err) {
          setError('Failed to load post details');
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      };

      if (id) {
        await API.put(`/posts/${id}`, payload);
      } else {
        await API.post('/posts', payload);
      }
      navigate(formData.isArchived ? '/archive' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '2rem auto', paddingBottom: '4rem' }}>
      <div className="glass-card animate-fade" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', pb: '1rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {id ? '✏️ Edit Blog Post' : '✍️ Create New Blog Post'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Publish your stories to the world or save them directly to your personal archive.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.88rem',
              marginBottom: '1.5rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Blog Title *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Master React 19 & Next-Gen State Management"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ fontSize: '1.1rem', fontWeight: 700 }}
            />
          </div>

          {/* Cover Image & Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Category *
              </label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: 'var(--bg-dark)', color: '#fff' }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ai, react, tutorial"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            />
            {formData.coverImage && (
              <div style={{ marginTop: '0.75rem', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <img src={formData.coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* Content Body */}
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Content Body *
            </label>
            <textarea
              className="form-input"
              rows="12"
              placeholder="Write your main article content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              style={{ lineHeight: 1.7 }}
            />
          </div>

          {/* Settings & Permissions Section */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ⚙️ Author Controls & Visibility
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.allowComments}
                onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
              />
              <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Allow readers to comment on this blog post
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isArchived}
                onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
              />
              <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Archive this post immediately (Will only be visible in your private Archive tab)
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '140px' }}
            >
              {loading ? 'Publishing...' : id ? 'Update Blog' : 'Publish Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditPost;
