import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await API.post(endpoint, formData);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {isLogin ? 'Welcome Back' : 'Create an Account'}
      </h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn" style={{ width: '100%', marginBottom: '1rem' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Register' : 'Login'}
        </span>
      </p>
    </div>
  );
};

export default Auth;
