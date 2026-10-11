import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const empty = { name: '', description: '', price: '', stock: '', category_id: '' };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const load = () => api('/products').then(setProducts);

  useEffect(() => { load(); api('/products/categories').then(setCategories); }, []);

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    try {
      const data = new FormData(); // FormData lets us send text fields and a picture together
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await api('/products', { method: 'POST', formData: data });
      setForm(empty); setImage(null); e.target.reset();
      setMessage('Dress added'); load();
    } catch (err) { setMessage(err.message); }
  }

  async function remove(p) {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    await api('/products/' + p.id, { method: 'DELETE' });
    load();
  }

  return (
    <div className="page">
      <h1 className="h2">Admin: products</h1>
      <form className="form admin-form" onSubmit={submit}>
        <label>Name<input className="input" value={form.name} onChange={change('name')} required /></label>
        <label>Description<textarea className="input" rows="3" value={form.description} onChange={change('description')} /></label>
        <label>Price<input className="input" type="number" step="0.01" min="0" value={form.price} onChange={change('price')} required /></label>
        <label>Stock<input className="input" type="number" min="0" value={form.stock} onChange={change('stock')} required /></label>
        <label>Category
          <select className="input" value={form.category_id} onChange={change('category_id')}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Photo<input className="input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} /></label>
        {message && <p className="muted">{message}</p>}
        <button className="btn">Add dress</button>
      </form>
      <h2 className="h3">All products</h2>
      {products.map((p) => (
        <div className="line" key={p.id}>
          <div className="grow"><strong>{p.name}</strong><div className="muted">{p.category || 'No category'}, stock {p.stock}</div></div>
          <span>{money(p.price)}</span>
          <button className="link" onClick={() => remove(p)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
