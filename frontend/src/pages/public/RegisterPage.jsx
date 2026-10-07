import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { BrandLogo } from '../../components/common/BrandLogo';
import { AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // 1. Register with backend POST /api/users
      await register({ name, email, password });
      showToast('Registration successful! Signing you in...', 'success');

      // 2. Auto-login with POST /api/auth/login
      try {
        await login({ email, password });
        navigate(from, { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        backgroundColor: 'var(--bg-paper)',
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'left',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <BrandLogo size="large" />
          <h2 style={{ fontSize: '1.6rem', marginTop: '16px', marginBottom: '6px' }}>
            Create Eventra Account
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
            Join Hyderabad's premier event discovery and ticketing platform.
          </p>
        </div>

        {errorMessage && (
          <div 
            style={{
              backgroundColor: 'var(--status-cancel-bg)',
              border: '1px solid var(--status-cancel-border)',
              borderRadius: 'var(--radius-xs)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--status-cancel-text)',
              fontSize: '0.86rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Harsha Vardhan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '12px',
              fontSize: '0.96rem',
              fontWeight: 600,
            }}
          >
            {loading ? 'Registering with Spring Boot...' : 'Create Account'}
          </button>
        </form>

        <div 
          style={{
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '24px',
            paddingTop: '20px',
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--ink-secondary)',
          }}
        >
          <span>Already have an account? </span>
          <Link 
            to="/login" 
            state={{ from }}
            style={{ color: 'var(--accent)', fontWeight: 600 }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

