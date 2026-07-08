import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import client from '../api/client';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await client.post('/api/auth/reset-password', {
        token,
        new_password: password,
      });
      setDone(true);
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed');
    }
  };

  if (done) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.title}>Password Reset</h2>
          <p style={{ textAlign: 'center', color: '#555' }}>
            Your password has been reset successfully.
          </p>
          <Link to="/login" style={styles.link}>Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Set New Password</h2>
        <input
          style={styles.input}
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button style={styles.btn} type="submit">Reset Password</button>
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
  link: {
    display: 'block', textAlign: 'center', color: '#1a1a2e',
    fontWeight: 600, textDecoration: 'none', marginTop: '8px',
  },
};
