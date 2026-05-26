import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
        Welcome to Bloggora
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
        Discover the latest thoughts, tutorials, and insights from developers around the world.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/posts" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Explore Posts
        </Link>
        {!localStorage.getItem('user') && (
          <Link to="/auth" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
            Join the Community
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
