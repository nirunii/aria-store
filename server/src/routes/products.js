// /api/products  ->  list, categories, one product, create (admin), delete (admin)
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Picture upload settings: saved into server/uploads, images only, max 5 MB
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../../uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

const SELECT = `SELECT p.*, c.name AS category, c.slug AS category_slug
                FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

router.get('/categories', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY id');
  res.json(rows);
});

router.get('/', async (req, res) => {
  const { category, search, sort, limit } = req.query;
  const where = [], params = [];
  if (category) { params.push(category); where.push(`c.slug = $${params.length}`); }
  if (search) { params.push(`%${search}%`); where.push(`p.name ILIKE $${params.length}`); }
  const order = { price_asc: 'p.price ASC', price_desc: 'p.price DESC' }[sort] || 'p.created_at DESC';
  let sql = `${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order}`;
  if (limit) { params.push(Math.min(parseInt(limit) || 20, 100)); sql += ` LIMIT $${params.length}`; }
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(`${SELECT} WHERE p.id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  res.json(rows[0]);
});

router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;
  if (!name || price === undefined || price === '') return res.status(400).json({ error: 'Name and price are required' });
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
  const { rows } = await pool.query(
    `INSERT INTO products(name,description,price,stock,category_id,image_url)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, description || '', price, stock || 0, category_id || null, imageUrl]
  );
  res.status(201).json(rows[0]);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { rows } = await pool.query('DELETE FROM products WHERE id=$1 RETURNING image_url', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  if (rows[0].image_url?.startsWith('/uploads/')) // also delete the picture file
    fs.unlink(path.join(__dirname, '../..', rows[0].image_url), () => {});
  res.json({ deleted: true });
});

module.exports = router;
