import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import CommentSection from '../components/CommentSection';

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await API.get(`/posts/${id}`);
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/posts/${id}`);
        navigate('/posts');
      } catch (error) {
        alert('Error deleting post');
      }
    }
  };

  if (!post) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading post...</div>;

  return (
    <div className="single-post-container">
      <div className="single-post-header">
        <h1 className="single-post-title">{post.title}</h1>
        <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>By {post.User?.name} on {new Date(post.createdAt).toLocaleDateString()}</span>
          {user && user._id === post.userId && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/edit-post/${post.id}`} className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>Edit</Link>
              <button onClick={handleDelete} className="btn btn-danger" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>Delete</button>
            </div>
          )}
        </div>
      </div>
      <div className="single-post-content">
        {post.content}
      </div>
      
      <CommentSection postId={post.id} comments={post.Comments} />
    </div>
  );
};

export default SinglePost;
