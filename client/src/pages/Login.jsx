import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      mode === 'login' ? await login(form.email, form.password) : await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) { setError(err.message); }
  }

  return (
    <form className="page narrow form" onSubmit={submit}>
      <h1 className="h2">{mode === 'login' ? 'Log in' : 'Create account'}</h1>
      {mode === 'register' && <label>Name<input className="input" value={form.name} onChange={change('name')} required /></label>}
      <label>Email<input className="input" type="email" value={form.email} onChange={change('email')} required /></label>
      <label>Password<input className="input" type="password" minLength={mode === 'register' ? 8 : undefined} value={form.password} onChange={change('password')} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn full">{mode === 'login' ? 'Log in' : 'Create account'}</button>
      <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
      </button>
    </form>
  );
}
