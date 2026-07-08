import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import client from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (sent) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.title}>Check Your Email</h2>
          <p style={{ textAlign: 'center', color: '#555' }}>
            If an account with that email exists, a reset link has been sent.
          </p>
          <Link to="/login" style={styles.link}>Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Forgot Password</h2>
        <input
          style={styles.input}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button style={styles.btn} type="submit">Send Reset Link</button>
        <p style={styles.text}>
          <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '60vh',
  },
  card: {
    background: '#fff', padding: '32px', borderRadius: '10px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  title: { margin: 0, textAlign: 'center', color: '#1a1a2e' },
  input: {
    padding: '10px 14px', fontSize: '1rem', borderRadius: '6px',
    border: '1px solid #ccc', outline: 'none',
  },
  btn: {
    padding: '10px', fontSize: '1rem', fontWeight: 600,
    background: '#1a1a2e', color: '#fff', border: 'none',
    borderRadius: '6px', cursor: 'pointer',
  },
  text: { textAlign: 'center', margin: 0, color: '#555' },
  link: {
    display: 'block', textAlign: 'center', color: '#1a1a2e',
    fontWeight: 600, textDecoration: 'none', marginTop: '8px',
  },
};
