import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, address: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (!items.length) return <div className="page"><p>Your bag is empty.</p><Link to="/shop" className="btn">Browse dresses</Link></div>;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const body = { shipping: form, items: items.map(({ productId, size, quantity }) => ({ productId, size, quantity })) };
      await api('/orders', { method: 'POST', body });
      clear();
      navigate('/orders');
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <form className="page narrow form" onSubmit={submit}>
      <h1 className="h2">Checkout</h1>
      <label>Full name<input className="input" value={form.name} onChange={change('name')} required /></label>
      <label>Delivery address<textarea className="input" rows="3" value={form.address} onChange={change('address')} required /></label>
      <label>Phone<input className="input" value={form.phone} onChange={change('phone')} required /></label>
      <p className="muted">Payment: pay on delivery. (Card payments can be added later, see the documentation.)</p>
      <div className="between total"><span>Total</span><strong>{money(total)}</strong></div>
      {error && <p className="error">{error}</p>}
      <button className="btn full" disabled={busy}>{busy ? 'Placing order...' : 'Place order'}</button>
    </form>
  );
}
