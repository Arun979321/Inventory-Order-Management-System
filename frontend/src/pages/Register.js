import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await client.post('/api/auth/register', form);
      login(res.data.access_token, res.data.user);
      toast.success('Registered successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Register</h2>
        <input
          style={styles.input}
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button style={styles.btn} type="submit">Create Account</button>
        <p style={styles.text}>
          Already have an account? <Link to="/login">Login</Link>
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
};
