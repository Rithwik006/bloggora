import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <h3 className="post-title">{post.title}</h3>
      <div className="post-meta">
        By {post.User?.name} on {new Date(post.createdAt).toLocaleDateString()}
      </div>
      <p className="post-excerpt">{post.content}</p>
      <Link to={`/posts/${post.id}`} className="btn">Read More</Link>
    </div>
  );
};

export default PostCard;
