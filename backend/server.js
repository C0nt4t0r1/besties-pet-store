require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "troque_em_producao";

// ── CORS: aceita o frontend local e o domínio da Vercel ────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // ex: https://besties-pet-store.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permite requests sem origin (ex: Render healthcheck, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqueado para: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ── PostgreSQL ──────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }  // necessário para Supabase/Railway
    : false,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL conectado"))
  .catch((err) => console.error("❌ Erro DB:", err.message));

// ── JWT Middlewares ─────────────────────────────────────────────────────────
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token não fornecido" });
  try {
    req.user = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  next();
}

// ═══════════════════════════════════════════════════════════════════════════
// ROTAS
// ═══════════════════════════════════════════════════════════════════════════

app.get("/api/health", (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

// ── Auth ────────────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email e senha obrigatórios" });
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email,role",
      [name, email, hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email já cadastrado" });
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query(
      "SELECT id,name,email,password_hash,role FROM users WHERE email=$1",
      [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: "Credenciais inválidas" });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Categorias ──────────────────────────────────────────────────────────────
app.get("/api/categories", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/categories/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories WHERE id=$1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Não encontrada" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/categories", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, slug, emoji, gradient } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO categories (name,slug,emoji,gradient) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, slug, emoji, gradient]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/categories/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, slug, emoji, gradient } = req.body;
    const { rows } = await pool.query(
      "UPDATE categories SET name=$1,slug=$2,emoji=$3,gradient=$4 WHERE id=$5 RETURNING *",
      [name, slug, emoji, gradient, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Não encontrada" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/categories/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM categories WHERE id=$1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Não encontrada" });
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Produtos ────────────────────────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const search = req.query.search || "";
    const category = req.query.category || "all";
    const { rows } = await pool.query(
      `SELECT p.id,p.title,p.price,p.emoji,p.bg,p.badge,c.slug AS category
       FROM products p JOIN categories c ON c.id=p.category_id
       WHERE p.active=true
         AND ($1='' OR p.title ILIKE '%'||$1||'%')
         AND ($2='all' OR c.slug=$2)
       ORDER BY p.id LIMIT 200`,
      [search, category]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT p.*,c.slug AS category FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=$1 AND p.active=true",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/products", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, price, emoji, bg, badge, category_id } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO products (title,price,emoji,bg,badge,category_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [title, price, emoji, bg, badge, category_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/products/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, price, emoji, bg, badge, category_id } = req.body;
    const { rows } = await pool.query(
      "UPDATE products SET title=$1,price=$2,emoji=$3,bg=$4,badge=$5,category_id=$6 WHERE id=$7 RETURNING *",
      [title, price, emoji, bg, badge, category_id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/products/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query("UPDATE products SET active=false WHERE id=$1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Não encontrado" });
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Pedidos ─────────────────────────────────────────────────────────────────
app.get("/api/orders", verifyToken, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.id,o.order_ref,o.total,o.status,o.customer_name,o.created_at,
              json_agg(json_build_object('title',oi.title,'qty',oi.qty,'price',oi.price,'emoji',oi.emoji,'subtotal',oi.subtotal)) AS items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
       GROUP BY o.id ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/orders/:ref", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.id,o.order_ref,o.total,o.status,o.customer_name,o.created_at,
              json_agg(json_build_object('title',oi.title,'qty',oi.qty,'price',oi.price,'emoji',oi.emoji,'subtotal',oi.subtotal)) AS items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
       WHERE o.order_ref=$1 GROUP BY o.id`,
      [req.params.ref]
    );
    if (!rows[0]) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_ref, total, customer_name, customer_email, items, user_id } = req.body;
    if (!items?.length) return res.status(400).json({ error: "Pedido sem itens" });
    await client.query("BEGIN");
    const { rows } = await client.query(
      "INSERT INTO orders (order_ref,total,customer_name,customer_email,user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [order_ref, total, customer_name, customer_email, user_id || null]
    );
    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id,product_id,title,price,qty,emoji) VALUES ($1,$2,$3,$4,$5,$6)",
        [rows[0].id, item.product_id || null, item.title, item.price, item.qty, item.emoji]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.patch("/api/orders/:ref/status", verifyToken, requireAdmin, async (req, res) => {
  try {
    const valid = ["pending","confirmed","shipped","delivered","cancelled"];
    if (!valid.includes(req.body.status))
      return res.status(400).json({ error: `Status inválido. Use: ${valid.join(", ")}` });
    const { rows } = await pool.query(
      "UPDATE orders SET status=$1 WHERE order_ref=$2 RETURNING *",
      [req.body.status, req.params.ref]
    );
    if (!rows[0]) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/orders/:ref", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM orders WHERE order_ref=$1", [req.params.ref]);
    if (!rowCount) return res.status(404).json({ error: "Não encontrado" });
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
