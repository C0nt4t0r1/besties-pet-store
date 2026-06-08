// =============================================================
//  BESTIES PET STORE — API Back-end
//  Arquivo: server.js
//  Tecnologia: Node.js + Express + SQLite (sql.js — sem compilação)
//
//  ENTIDADES COM CRUD COMPLETO:
//    1. categories  — GET, POST, PUT, DELETE
//    2. products    — GET, POST, PUT, DELETE (soft delete)
//    3. orders      — GET, POST, PATCH /status, DELETE
//  AUTENTICAÇÃO:
//    POST /api/auth/register
//    POST /api/auth/login   (retorna JWT)
//
//  O banco besties.db é criado automaticamente na primeira execução.
// =============================================================

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const initSqlJs  = require('sql.js');
const fs         = require('fs');
const path       = require('path');

const app    = express();
const PORT   = process.env.PORT       || 3001;
const SECRET = process.env.JWT_SECRET || 'besties_secret_dev_2024';
const DB_PATH = path.join(__dirname, 'besties.db');

app.use(cors());
app.use(express.json());

// =============================================================
//  BANCO DE DADOS — helpers sql.js
// =============================================================
let db; // instância global

function saveDb() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

// Executa SQL sem retorno (INSERT/UPDATE/DELETE)
function run(sql, params = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const lid = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] ?? null;
  saveDb();
  return { changes, lastInsertRowid: lid };
}

// Retorna todas as linhas como array de objetos
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// Retorna apenas a primeira linha
function get(sql, params = []) {
  return all(sql, params)[0] ?? null;
}

// =============================================================
//  INICIALIZAÇÃO DO BANCO
// =============================================================
async function initDb() {
  const SQL = await initSqlJs();
  db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  // Criar tabelas
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      slug       TEXT UNIQUE NOT NULL,
      emoji      TEXT,
      gradient   TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      price       REAL NOT NULL CHECK (price >= 0),
      emoji       TEXT,
      bg          TEXT,
      badge       TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'customer'
                      CHECK (role IN ('customer','admin')),
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      order_ref      TEXT UNIQUE NOT NULL,
      user_id        INTEGER REFERENCES users(id),
      total          REAL NOT NULL CHECK (total >= 0),
      status         TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
      customer_name  TEXT,
      customer_email TEXT,
      created_at     TEXT DEFAULT (datetime('now')),
      updated_at     TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      title      TEXT NOT NULL,
      price      REAL NOT NULL CHECK (price >= 0),
      qty        INTEGER NOT NULL CHECK (qty > 0),
      emoji      TEXT
    );
  `);
  saveDb();

  // Seed inicial — só roda se o banco estiver vazio
  const total = get('SELECT COUNT(*) as n FROM categories').n;
  if (total === 0) {
    db.exec(`
      INSERT INTO categories (name, slug, emoji, gradient) VALUES
        ('Dogs',           'dogs',         '🐕', 'linear-gradient(155deg,#6b3a0a 0%,#c4891d 100%)'),
        ('Cats',           'cats',         '🐈', 'linear-gradient(155deg,#3b0d6e 0%,#8b3dc4 100%)'),
        ('Birds',          'birds',        '🦜', 'linear-gradient(155deg,#083060 0%,#1669b8 100%)'),
        ('Fish & Aquatics','fish',         '🐠', 'linear-gradient(155deg,#043328 0%,#0a7055 100%)'),
        ('Small Animals',  'small-animals','🐹', 'linear-gradient(155deg,#4a1200 0%,#a03a08 100%)'),
        ('Reptiles',       'reptiles',     '🦎', 'linear-gradient(155deg,#0f3020 0%,#1d7042 100%)');

      INSERT INTO products (title,price,emoji,bg,badge,category_id)
        SELECT 'Premium Dog Food',  89.90,'🐾','#FFF0EB','Best Seller',id FROM categories WHERE slug='dogs';
      INSERT INTO products (title,price,emoji,bg,badge,category_id)
        SELECT 'Dog Dental Chews',  35.90,'🦴','#FFF0EB','50% Off',id FROM categories WHERE slug='dogs';
      INSERT INTO products (title,price,emoji,bg,category_id)
        SELECT 'Puppy Shampoo',     29.90,'🛁','#FFF0EB',id FROM categories WHERE slug='dogs';
      INSERT INTO products (title,price,emoji,bg,category_id)
        SELECT 'Retractable Leash', 55.00,'🦮','#FFF0EB',id FROM categories WHERE slug='dogs';
      INSERT INTO products (title,price,emoji,bg,category_id)
        SELECT 'Cat Treats Deluxe', 16.99,'😺','#F0EBFF',id FROM categories WHERE slug='cats';
      INSERT INTO products (title,price,emoji,bg,category_id)
        SELECT 'Premium Cat Litter',42.99,'🏠','#F0EBFF',id FROM categories WHERE slug='cats';
      INSERT INTO products (title,price,emoji,bg,badge,category_id)
        SELECT 'Feather Cat Toy',   19.99,'🪶','#F0EBFF','New',id FROM categories WHERE slug='cats';
      INSERT INTO products (title,price,emoji,bg,badge,category_id)
        SELECT 'Bird Seed Mix',     24.50,'🌾','#EBF0FF','New',id FROM categories WHERE slug='birds';
      INSERT INTO products (title,price,emoji,bg,category_id)
        SELECT 'Aquarium Flakes',   18.75,'🐟','#EBF8FF',id FROM categories WHERE slug='fish';
      INSERT INTO products (title,price,emoji,bg,category_id)
        SELECT 'Aquarium Decor Set',38.99,'🪸','#EBF8FF',id FROM categories WHERE slug='fish';
      INSERT INTO products (title,price,emoji,bg,category_id)
        SELECT 'Hamster Pellets',   12.99,'🐹','#FFF5EB',id FROM categories WHERE slug='small-animals';
      INSERT INTO products (title,price,emoji,bg,badge,category_id)
        SELECT 'Reptile Heat Lamp',145.00,'🦎','#EBFFEF','Pro',id FROM categories WHERE slug='reptiles';
    `);
    saveDb();
    console.log('Banco populado com dados iniciais.');
  }

  console.log(`Servidor Besties Pet Store rodando em http://localhost:${PORT}`);
  console.log('Principais endpoints: GET /api/categories  GET /api/products  GET /api/health');
}

// =============================================================
//  MIDDLEWARES DE AUTENTICAÇÃO
// =============================================================

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  next();
}

// =============================================================
//  CATEGORIAS  (CRUD completo — Entidade 1)
// =============================================================

app.get('/api/categories', (req, res) => {
  try {
    res.json(all('SELECT id, name, slug, emoji, gradient FROM categories ORDER BY id'));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/categories/:id', (req, res) => {
  try {
    const row = get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categories', authMiddleware, adminMiddleware, (req, res) => {
  const { name, slug, emoji, gradient } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name e slug são obrigatórios' });
  try {
    const { lastInsertRowid } = run(
      'INSERT INTO categories (name, slug, emoji, gradient) VALUES (?,?,?,?)',
      [name, slug, emoji ?? null, gradient ?? null]
    );
    res.status(201).json(get('SELECT * FROM categories WHERE id = ?', [lastInsertRowid]));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Slug já existe' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const cur = get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!cur) return res.status(404).json({ error: 'Categoria não encontrada' });
    const { name, slug, emoji, gradient } = req.body;
    run(
      'UPDATE categories SET name=?, slug=?, emoji=?, gradient=? WHERE id=?',
      [name ?? cur.name, slug ?? cur.slug, emoji ?? cur.emoji, gradient ?? cur.gradient, req.params.id]
    );
    res.json(get('SELECT * FROM categories WHERE id = ?', [req.params.id]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/categories/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { changes } = run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (!changes) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
//  PRODUTOS  (CRUD completo — Entidade 2)
// =============================================================

app.get('/api/products', (req, res) => {
  const search   = `%${req.query.search || ''}%`;
  const category = req.query.category   || 'all';
  try {
    const rows = all(`
      SELECT p.id, p.title, p.price, p.emoji, p.bg, p.badge,
             c.slug AS category, c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.active = 1
        AND p.title LIKE ?
        AND (? = 'all' OR c.slug = ?)
      ORDER BY p.id LIMIT 200
    `, [search, category, category]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const row = get(`
      SELECT p.id, p.title, p.price, p.emoji, p.bg, p.badge,
             c.slug AS category, c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = ? AND p.active = 1
    `, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', authMiddleware, adminMiddleware, (req, res) => {
  const { title, price, emoji, bg, badge, category_id } = req.body;
  if (!title || price == null || !category_id)
    return res.status(400).json({ error: 'title, price e category_id são obrigatórios' });
  try {
    const { lastInsertRowid } = run(
      'INSERT INTO products (title,price,emoji,bg,badge,category_id) VALUES (?,?,?,?,?,?)',
      [title, price, emoji ?? null, bg ?? null, badge ?? null, category_id]
    );
    res.status(201).json(get('SELECT * FROM products WHERE id = ?', [lastInsertRowid]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const cur = get('SELECT * FROM products WHERE id = ? AND active = 1', [req.params.id]);
    if (!cur) return res.status(404).json({ error: 'Produto não encontrado' });
    const { title, price, emoji, bg, badge, category_id } = req.body;
    run(`
      UPDATE products SET title=?,price=?,emoji=?,bg=?,badge=?,category_id=?,
        updated_at=datetime('now') WHERE id=?
    `, [
      title       ?? cur.title,
      price       ?? cur.price,
      emoji       ?? cur.emoji,
      bg          ?? cur.bg,
      badge       ?? cur.badge,
      category_id ?? cur.category_id,
      req.params.id
    ]);
    res.json(get('SELECT * FROM products WHERE id = ?', [req.params.id]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Soft delete: marca active = 0, não remove do banco
app.delete('/api/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { changes } = run(
      'UPDATE products SET active=0 WHERE id=? AND active=1', [req.params.id]
    );
    if (!changes) return res.status(404).json({ error: 'Produto não encontrado' });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
//  PEDIDOS  (CRUD completo — Entidade 3)
// =============================================================

app.get('/api/orders', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const orders = all(`
      SELECT o.id, o.order_ref, o.status, o.total,
             o.customer_name, o.customer_email, o.created_at,
             COUNT(oi.id) AS qtd_itens
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100
    `);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders/:ref', (req, res) => {
  try {
    const order = get('SELECT * FROM orders WHERE order_ref = ?', [req.params.ref]);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    const items = all(`
      SELECT title, price, qty, ROUND(price*qty,2) AS subtotal, emoji
      FROM order_items WHERE order_id = ? ORDER BY id
    `, [order.id]);
    delete order.customer_email; // não expõe e-mail na rota pública
    res.json({ ...order, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', (req, res) => {
  const { order_ref, total, user_id, customer_name, customer_email, items } = req.body;
  if (!order_ref || total == null || !items?.length)
    return res.status(400).json({ error: 'order_ref, total e items são obrigatórios' });
  try {
    const { lastInsertRowid } = run(
      'INSERT INTO orders (order_ref,total,user_id,customer_name,customer_email) VALUES (?,?,?,?,?)',
      [order_ref, total, user_id ?? null, customer_name ?? null, customer_email ?? null]
    );
    for (const item of items) {
      run(
        'INSERT INTO order_items (order_id,product_id,title,price,qty,emoji) VALUES (?,?,?,?,?,?)',
        [lastInsertRowid, item.product_id ?? null, item.title, item.price, item.qty, item.emoji ?? null]
      );
    }
    res.status(201).json(get('SELECT * FROM orders WHERE id = ?', [lastInsertRowid]));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'order_ref já existe' });
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:ref/status', authMiddleware, adminMiddleware, (req, res) => {
  const { status } = req.body;
  const validos = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validos.includes(status))
    return res.status(400).json({ error: `Status inválido. Use: ${validos.join(', ')}` });
  try {
    const { changes } = run(
      `UPDATE orders SET status=?, updated_at=datetime('now') WHERE order_ref=?`,
      [status, req.params.ref]
    );
    if (!changes) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(get('SELECT * FROM orders WHERE order_ref = ?', [req.params.ref]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/orders/:ref', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { changes } = run('DELETE FROM orders WHERE order_ref = ?', [req.params.ref]);
    if (!changes) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
//  AUTENTICAÇÃO
// =============================================================

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email e password são obrigatórios' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const { lastInsertRowid } = run(
      'INSERT INTO users (name, email, password_hash) VALUES (?,?,?)',
      [name ?? null, email, hash]
    );
    res.status(201).json(
      get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [lastInsertRowid])
    );
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'E-mail já cadastrado' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email e password são obrigatórios' });
  try {
    const user = get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
//  HEALTH CHECK
// =============================================================
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// =============================================================
//  INICIALIZA BANCO E SOBE O SERVIDOR
// =============================================================
initDb().then(() => app.listen(PORT)).catch(err => {
  console.error('Erro ao iniciar:', err.message);
  process.exit(1);
});
