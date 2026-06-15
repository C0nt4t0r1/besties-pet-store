-- =============================================================
-- BESTIES PET STORE — Queries de Referência
-- Arquivo: database/003_queries.sql
-- NÃO execute este arquivo direto — é só referência.
-- Cada bloco corresponde a um endpoint do server.js.
-- =============================================================

-- ── GET /api/products?search=dog&category=dogs ──────────────
SELECT p.id, p.title, p.price, p.emoji, p.bg, p.badge,
       c.slug AS category
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.active = true
  AND ($1 = '' OR p.title ILIKE '%' || $1 || '%')
  AND ($2 = 'all' OR c.slug = $2)
ORDER BY p.id
LIMIT 200;

-- ── POST /api/orders (dentro de transação) ──────────────────
-- 1. Inserir pedido
INSERT INTO orders (order_ref, total, customer_name, customer_email, user_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- 2. Inserir cada item
INSERT INTO order_items (order_id, product_id, title, price, qty, emoji)
VALUES ($1, $2, $3, $4, $5, $6);
-- subtotal é calculado automaticamente pelo banco (GENERATED ALWAYS AS price * qty)

-- ── GET /api/orders (admin) ─────────────────────────────────
SELECT o.id, o.order_ref, o.total, o.status, o.customer_name, o.created_at,
       json_agg(json_build_object(
         'title', oi.title, 'qty', oi.qty, 'price', oi.price,
         'emoji', oi.emoji, 'subtotal', oi.subtotal
       )) AS items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id
ORDER BY o.created_at DESC;

-- ── GET /api/orders/:ref (público — sem customer_email) ─────
SELECT o.id, o.order_ref, o.total, o.status, o.customer_name, o.created_at,
       json_agg(json_build_object(
         'title', oi.title, 'qty', oi.qty, 'price', oi.price,
         'emoji', oi.emoji, 'subtotal', oi.subtotal
       )) AS items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.order_ref = $1
GROUP BY o.id;

-- ── Produtos mais vendidos (excluindo cancelados) ────────────
SELECT p.title, SUM(oi.qty) AS total_vendido
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY p.id, p.title
ORDER BY total_vendido DESC
LIMIT 10;
