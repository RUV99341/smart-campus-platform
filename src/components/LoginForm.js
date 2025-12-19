import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // placeholder: email/password auth isn't wired — prompt to use Google
    alert('Email/password login is a placeholder. Use Google Sign-In.');
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="logo">Smart Campus</div>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="auth-input"
            placeholder="Phone number, username, or email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password-row">
            <input
              className="auth-input"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="show-pw" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button className="btn-primary" type="submit">Log in</button>
        </form>

        <div className="or-divider"><span>OR</span></div>

        <button className="btn-google" onClick={signInWithGoogle}>Log in with Google</button>

        <a className="forgot" href="/forgot-password">Forgot password?</a>
      </div>

      <div className="signup-card">
        Don't have an account? <a href="/signup">Sign up</a>
      </div>
    </div>
  );
}
