import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../api.js';
import { ProductImage } from '../components/ProductCard.jsx';

export default function Cart() {
  const { items, setQty, remove, total, keyOf } = useCart();
  if (!items.length)
    return <div className="page"><h1 className="h2">Your bag is empty</h1><Link to="/shop" className="btn">Browse dresses</Link></div>;

  return (
    <div className="page">
      <h1 className="h2">Your bag</h1>
      {items.map((i) => (
        <div className="line" key={keyOf(i)}>
          <ProductImage product={{ id: i.productId, name: i.name, image_url: i.image_url }} className="thumb" />
          <div className="grow"><strong>{i.name}</strong><div className="muted">Size {i.size}</div></div>
          <div className="qty">
            <button onClick={() => setQty(keyOf(i), i.quantity - 1)} aria-label="Decrease quantity">-</button>
            <span>{i.quantity}</span>
            <button onClick={() => setQty(keyOf(i), i.quantity + 1)} aria-label="Increase quantity">+</button>
          </div>
          <strong>{money(i.price * i.quantity)}</strong>
          <button className="link" onClick={() => remove(keyOf(i))}>Remove</button>
        </div>
      ))}
      <div className="between total"><span>Total</span><strong>{money(total)}</strong></div>
      <Link to="/checkout" className="btn">Go to checkout</Link>
    </div>
  );
}
