import { useState } from 'react';
import API from '../api/axios';

const CommentSection = ({ postId, comments: initialComments }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [text, setText] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await API.post(`/comments/${postId}`, { text });
      // To display author name immediately without refresh, attach user object
      const newComment = { ...data, User: { name: user.name } };
      setComments([...comments, newComment]);
      setText('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await API.delete(`/comments/${commentId}`);
        setComments(comments.filter(c => c.id !== commentId));
      } catch (error) {
        alert('Error deleting comment');
      }
    }
  };

  return (
    <div className="comments-section">
      <h3>Comments ({comments.length})</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} style={{ margin: '1.5rem 0' }}>
          <div className="form-group">
            <textarea
              className="form-control"
              placeholder="Leave a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ minHeight: '80px' }}
            ></textarea>
          </div>
          <button type="submit" className="btn">Post Comment</button>
        </form>
      ) : (
        <p style={{ margin: '1.5rem 0', color: 'var(--text-muted)' }}>Please log in to leave a comment.</p>
      )}

      <div>
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-meta">
              <span><strong>{comment.User?.name}</strong> • {new Date(comment.createdAt).toLocaleDateString()}</span>
              {user && user._id === comment.userId && (
                <button 
                  onClick={() => handleDelete(comment.id)} 
                  style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Delete
                </button>
              )}
            </div>
            <div className="comment-text">{comment.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
