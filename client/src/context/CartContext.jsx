import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]); // survives page refresh

  const keyOf = (i) => `${i.productId}-${i.size}`;
  function add(product, size, quantity = 1) {
    setItems((prev) => {
      const item = { productId: product.id, name: product.name, price: Number(product.price), image_url: product.image_url, size, quantity };
      const found = prev.find((i) => keyOf(i) === keyOf(item));
      return found ? prev.map((i) => (keyOf(i) === keyOf(item) ? { ...i, quantity: i.quantity + quantity } : i)) : [...prev, item];
    });
  }
  const setQty = (key, quantity) =>
    setItems((prev) => prev.map((i) => (keyOf(i) === key ? { ...i, quantity: Math.max(1, quantity) } : i)));
  const remove = (key) => setItems((prev) => prev.filter((i) => keyOf(i) !== key));
  const clear = () => setItems([]);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total, keyOf }}>{children}</CartContext.Provider>;
}
