import { Link } from 'react-router-dom';
import { money, imgUrl } from '../api.js';

const TINTS = ['#DDD3F7', '#FFD3C7', '#C9E8DF', '#F5E7A8'];

// Shows the product picture, or a coloured block if the product has no picture yet.
export function ProductImage({ product, className = '' }) {
  return product.image_url ? (
    <img className={`pimg ${className}`} src={imgUrl(product.image_url)} alt={product.name} loading="lazy" />
  ) : (
    <div className={`pimg placeholder ${className}`} style={{ background: TINTS[product.id % TINTS.length] }}>No photo yet</div>
  );
}

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="card">
      <ProductImage product={product} />
      <div className="card-row"><strong>{product.name}</strong><span>{money(product.price)}</span></div>
      <span className="muted">{product.stock > 0 ? 'View dress' : 'Sold out'}</span>
    </Link>
  );
}
