import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';

const CreateEditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const { data } = await API.get(`/posts/${id}`);
          setTitle(data.title);
          setContent(data.content);
        } catch (error) {
          console.error('Error fetching post', error);
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await API.put(`/posts/${id}`, { title, content });
      } else {
        await API.post('/posts', { title, content });
      }
      navigate('/posts');
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem' }}>{id ? 'Edit Post' : 'Create New Post'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter an engaging title"
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write your blog content here..."
            style={{ minHeight: '300px' }}
          ></textarea>
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Post'}
        </button>
      </form>
    </div>
  );
};

export default CreateEditPost;
