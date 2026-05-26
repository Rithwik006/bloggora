import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">Bloggora</Link>
        <div className="nav-links">
          <Link to="/posts" className="nav-link">Posts</Link>
          {user ? (
            <>
              <Link to="/create-post" className="nav-link">Create Post</Link>
              <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="btn">Login / Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
