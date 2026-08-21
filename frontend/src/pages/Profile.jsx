import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUserProfile } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'archive'
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    avatarUrl: '',
    isPrivate: false
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const targetUsername = username || (currentUser ? currentUser.username : '');
      if (!targetUsername) {
        setError('User not specified');
        setLoading(false);
        return;
      }

      const res = await API.get(`/users/profile/${targetUsername}`);
      setProfileData(res.data);

      if (res.data.user.isSelf) {
        setEditForm({
          name: res.data.user.name || '',
          username: res.data.user.username || '',
          bio: res.data.user.bio || '',
          avatarUrl: res.data.user.avatarUrl || '',
          isPrivate: Boolean(res.data.user.isPrivate)
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchive = async () => {
    try {
      const res = await API.get('/posts/my-archive');
      setArchivedPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser]);

  useEffect(() => {
    if (activeTab === 'archive' && profileData?.user?.isSelf) {
      fetchArchive();
    }
  }, [activeTab]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('Please sign in to follow users');
      return;
    }
    try {
      const res = await API.post(`/users/${profileData.user.id}/follow`);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Follow action failed');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await API.put('/auth/profile', editForm);
      updateUserProfile(res.data);
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleArchivePost = async (postId) => {
    try {
      await API.patch(`/posts/${postId}/archive`);
      fetchProfile();
      if (activeTab === 'archive') {
        fetchArchive();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive post');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        Loading user profile...
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', margin: '3rem auto', maxWidth: '500px' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>User Profile Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'User does not exist.'}</p>
        <Link to="/" className="btn btn-primary">Return to Feed</Link>
      </div>
    );
  }

  const { user, canViewContent, posts } = profileData;
  const avatarSrc = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', paddingBottom: '4rem' }}>
      {/* Profile Header Card */}
      <div className="glass-card animate-fade" style={{ padding: '2.5rem 2rem', marginBottom: '2.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <img
            src={avatarSrc}
            alt={user.name}
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{user.name}</h2>
              <span style={{ color: 'var(--accent-primary)', fontSize: '1.05rem', fontWeight: 600 }}>@{user.username}</span>
              {user.isPrivate ? (
                <span className="archive-badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                  🔒 Private Account
                </span>
              ) : (
                <span className="category-pill">🌐 Public Account</span>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', margin: '0.6rem 0 1rem 0', lineHeight: 1.5 }}>
              {user.bio || 'No bio provided yet.'}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>{user.followersCount}</strong> Followers
              </span>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>{user.followingCount}</strong> Following
              </span>
            </div>
          </div>

          {/* Action Button: Edit or Follow */}
          <div>
            {user.isSelf ? (
              <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                ⚙️ Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`btn ${user.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {user.isFollowing ? '✓ Following' : user.followStatus === 'pending' ? '⏳ Requested' : '+ Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(8, 12, 20, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justify: 'center'
          }}
          onClick={() => setIsEditing(false)}
        >
          <div
            className="glass-card animate-fade"
            style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>⚙️ Edit Profile Settings</h3>

            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Username (@username)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Bio / Tagline
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>

              {/* Private Account Toggle */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editForm.isPrivate}
                    onChange={(e) => setEditForm({ ...editForm, isPrivate: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Make Profile Private
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Only followers you approve will be able to see your posts and details.
                    </div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saveLoading}>
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Private Profile Screen */}
      {!canViewContent ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>This Account is Private</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Follow @{user.username} to request access to their published blogs.
          </p>
        </div>
      ) : (
        <>
          {/* Profile Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-subtle)', pb: '0.75rem' }}>
            <button
              className={`btn btn-sm ${activeTab === 'published' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('published')}
            >
              📝 Published Blogs ({posts ? posts.length : 0})
            </button>
            {user.isSelf && (
              <button
                className={`btn btn-sm ${activeTab === 'archive' ? 'btn-gold' : 'btn-secondary'}`}
                onClick={() => setActiveTab('archive')}
              >
                📁 My Private Archive ({archivedPosts ? archivedPosts.length : 0})
              </button>
            )}
          </div>

          {/* Posts Grid */}
          {activeTab === 'published' ? (
            posts.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No published posts yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
                {posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    isOwner={user.isSelf}
                    onToggleArchive={handleToggleArchivePost}
                  />
                ))}
              </div>
            )
          ) : (
            archivedPosts.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Your archive is empty. Posts you archive will appear here in reverse chronological order.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
                {archivedPosts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    isOwner={true}
                    onToggleArchive={handleToggleArchivePost}
                  />
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
