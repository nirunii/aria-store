import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [latest, setLatest] = useState([]);
  useEffect(() => {
    api('/products/categories').then(setCategories).catch(() => {});
    api('/products?sort=new&limit=4').then(setLatest).catch(() => {});
  }, []);
  const tints = ['#DDD3F7', '#FFD3C7', '#C9E8DF', '#F5E7A8'];

  return (
    <>
      <section className="hero">
        <div className="hero-word">ARIA</div>
        {/* Put your own picture at client/public/hero.jpg to fill this arch */}
        <div className="hero-arch" />
        <div className="hero-copy">
          <p>Dresses cut for movement. Made to be worn from first light to last dance.</p>
          <Link to="/shop" className="btn">Shop the edit</Link>
        </div>
      </section>

      <section className="page">
        <h2 className="h2">Shop by occasion</h2>
        <div className="grid4">
          {categories.map((c, i) => (
            <Link key={c.id} to={`/shop?category=${c.slug}`} className="cat" style={{ background: tints[i % 4] }}>
              <span className="h3">{c.name}</span><span>Shop now</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="page">
        <div className="between"><h2 className="h2">New arrivals</h2><Link to="/shop" className="underline">View all</Link></div>
        {latest.length === 0 ? <p className="muted">No dresses yet. Run the database setup, or add one in Admin.</p> : (
          <div className="grid4">{latest.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>
    </>
  );
}
