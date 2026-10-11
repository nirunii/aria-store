import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { ProductImage } from '../components/ProductCard.jsx';

export default function Product() {
  const { id } = useParams();
  const { add } = useCart();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [size, setSize] = useState('');
  const [loadError, setLoadError] = useState('');
  const [sizeError, setSizeError] = useState('');

  useEffect(() => { api('/products/' + id).then(setP).catch((e) => setLoadError(e.message)); }, [id]);
  if (loadError) return <p className="page">{loadError}</p>;
  if (!p) return <p className="page muted">Loading...</p>;

  const addToBag = () => {
    if (!size) return setSizeError('Choose a size first');
    add(p, size);
    navigate('/cart');
  };

  return (
    <div className="page detail">
      <ProductImage product={p} className="detail-img" />
      <div className="detail-info">
        <span className="muted">{p.category}</span>
        <h1 className="h2">{p.name}</h1>
        <p className="price">{money(p.price)}</p>
        <p>{p.description}</p>
        <h3 className="label">Size</h3>
        <div className="chips">
          {p.sizes.map((s) => <button key={s} className={`size ${size === s ? 'on' : ''}`} onClick={() => { setSize(s); setSizeError(''); }}>{s}</button>)}
        </div>
        {sizeError && <p className="error">{sizeError}</p>}
        <button className="btn full" disabled={p.stock < 1} onClick={addToBag}>{p.stock < 1 ? 'Sold out' : 'Add to bag'}</button>
        {p.stock > 0 && p.stock <= 5 && <p className="muted">Only {p.stock} left</p>}
      </div>
    </div>
  );
}
