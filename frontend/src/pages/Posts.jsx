import { useState, useEffect } from 'react';
import API from '../api/axios';
import PostCard from '../components/PostCard';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await API.get('/posts');
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading posts...</div>;

  return (
    <div>
      <h1 className="page-title">Latest Posts</h1>
      {posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No posts found. Be the first to create one!</p>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
