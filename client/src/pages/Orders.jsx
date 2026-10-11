import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api('/orders/mine').then(setOrders).catch(() => setOrders([])); }, []);
  if (!orders) return <p className="page muted">Loading...</p>;
  if (!orders.length) return <div className="page"><h1 className="h2">No orders yet</h1><Link to="/shop" className="btn">Browse dresses</Link></div>;

  return (
    <div className="page">
      <h1 className="h2">My orders</h1>
      {orders.map((o) => (
        <div className="order" key={o.id}>
          <div className="between"><strong>Order #{o.id}</strong><span className="badge">{o.status}</span></div>
          <p className="muted">{new Date(o.created_at).toLocaleDateString()}</p>
          {o.items.map((i, n) => <div key={n} className="between"><span>{i.name} ({i.size}) x {i.quantity}</span><span>{money(i.unit_price * i.quantity)}</span></div>)}
          <div className="between total"><span>Total</span><strong>{money(o.total)}</strong></div>
        </div>
      ))}
    </div>
  );
}
