import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'new';

  useEffect(() => { api('/products/categories').then(setCategories).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ sort });
    if (category) q.set('category', category);
    if (search) q.set('search', search);
    api('/products?' + q).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [category, search, sort]);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  return (
    <div className="page">
      <h1 className="h2">{categories.find((c) => c.slug === category)?.name || 'All dresses'}</h1>
      <div className="filters">
        <div className="chips">
          <button className={`chip ${!category ? 'on' : ''}`} onClick={() => set('category', '')}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={`chip ${category === c.slug ? 'on' : ''}`} onClick={() => set('category', c.slug)}>{c.name}</button>
          ))}
        </div>
        <input className="input" placeholder="Search dresses" defaultValue={search} onKeyDown={(e) => e.key === 'Enter' && set('search', e.target.value)} aria-label="Search dresses" />
        <select className="input" value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort dresses">
          <option value="new">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
      {loading ? <p className="muted">Loading dresses...</p> : products.length === 0 ? (
        <p>No dresses match. <Link to="/shop" className="underline">Clear filters</Link></p>
      ) : <div className="grid4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
    </div>
  );
}
