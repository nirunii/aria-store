// /api/orders  ->  place an order, list my orders
const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const fail = (status, message) => Object.assign(new Error(message), { status });

router.post('/', requireAuth, async (req, res) => {
  const { items, shipping } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Your bag is empty' });
  if (!shipping?.name || !shipping?.address || !shipping?.phone)
    return res.status(400).json({ error: 'Enter your name, address and phone number' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // all-or-nothing: if anything fails, nothing is saved
    let total = 0;
    const lines = [];
    for (const it of items) {
      // Prices come from the database, never from the browser, so they cannot be faked
      const { rows } = await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE', [it.productId]);
      const p = rows[0];
      const qty = parseInt(it.quantity);
      if (!p) throw fail(400, 'A dress in your bag is no longer available');
      if (!qty || qty < 1 || p.stock < qty) throw fail(400, `Only ${p.stock} left of ${p.name}`);
      if (!p.sizes.includes(it.size)) throw fail(400, `Size ${it.size} is not available for ${p.name}`);
      total += Number(p.price) * qty;
      lines.push({ p, qty, size: it.size });
    }
    total = Math.round(total * 100) / 100;
    const order = (await client.query(
      `INSERT INTO orders(user_id,total,shipping_name,shipping_address,phone) VALUES($1,$2,$3,$4,$5) RETURNING id`,
      [req.user.id, total, shipping.name, shipping.address, shipping.phone]
    )).rows[0];
    for (const l of lines) {
      await client.query(
        `INSERT INTO order_items(order_id,product_id,name,size,quantity,unit_price) VALUES($1,$2,$3,$4,$5,$6)`,
        [order.id, l.p.id, l.p.name, l.size, l.qty, l.p.price]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id=$2', [l.qty, l.p.id]);
    }
    await client.query('COMMIT');
    res.status(201).json({ orderId: order.id, total });
  } catch (e) {
    await client.query('ROLLBACK');
    if (!e.status) console.error(e);
    res.status(e.status || 500).json({ error: e.status ? e.message : 'Could not place your order' });
  } finally {
    client.release();
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.*, COALESCE(json_agg(json_build_object('name',i.name,'size',i.size,'quantity',i.quantity,'unit_price',i.unit_price))
            FILTER (WHERE i.id IS NOT NULL), '[]') AS items
     FROM orders o LEFT JOIN order_items i ON i.order_id = o.id
     WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

module.exports = router;
