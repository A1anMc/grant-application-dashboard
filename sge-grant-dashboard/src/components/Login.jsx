import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);
    if (result.success) {
      console.log('🎯 Regular login successful, redirecting...');
      navigate('/overview');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    console.log('🎯 Demo login button clicked');
    setError('');
    setLoading(true);
    const result = await demoLogin();
    console.log('🎯 Demo login result:', result);
    if (result.success) {
      console.log('🎯 Demo login successful, redirecting...');
      navigate('/overview');
    } else {
      console.log('🎯 Demo login failed:', result.error);
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <img src="/goose-logo.svg" alt="Shadow Goose" />
          </div>
          <h1>Grant IQ Pro Edition</h1>
          <p>Your comprehensive grant management platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Enter your username or email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-section">
          <div className="divider">
            <span>or</span>
          </div>
          <button 
            onClick={handleDemoLogin} 
            className="demo-btn"
            disabled={loading}
          >
            🚀 Try Demo Mode
          </button>
          <p className="demo-info">
            Demo credentials: alan/admin123 • ursula/admin123 • sham/admin123
          </p>
        </div>

        <div className="features-preview">
          <h3>What's included:</h3>
          <ul>
            <li>🔍 Grant Discovery & Search</li>
            <li>📊 AI Eligibility Analysis</li>
            <li>📋 Task Planning Engine</li>
            <li>👥 Team Collaboration</li>
            <li>📁 Document Management</li>
            <li>📈 Analytics Dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login; 