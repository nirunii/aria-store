import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  return (
    <header className="nav">
      <Link to="/" className="brand">ARIA</Link>
      <nav className="nav-links">
        <NavLink to="/shop">All dresses</NavLink>
        <NavLink to="/shop?category=evening">Evening</NavLink>
        <NavLink to="/shop?category=wedding-guest">Wedding guest</NavLink>
        {user?.is_admin && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-right">
        {user ? (
          <>
            <Link to="/orders">My orders</Link>
            <button className="link" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <Link to="/login">Log in</Link>
        )}
        <Link to="/cart" className="pill">Bag ({count})</Link>
      </div>
    </header>
  );
}
