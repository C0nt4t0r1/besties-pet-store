-- =============================================================
--  BESTIES PET STORE — Queries da API
--  Arquivo: 003_queries.sql
--  Revisão: v2 (corrigido)
--
--  CORREÇÕES APLICADAS:
--  1. GET /api/products: unificada em UMA única query com
--     lógica condicional. Duas queries separadas para o mesmo
--     endpoint causavam divergência fácil de introduzir bugs.
--  2. POST /api/orders: adicionado BEGIN/COMMIT explícito no
--     comentário — o código Node.js DEVE usar transação ao
--     inserir order + order_items. Se um item falhar, o pedido
--     inteiro deve ser revertido.
--  3. GET /api/orders/:ref: adicionado filtro de segurança
--     para não expor customer_email a clientes não autorizados
--     (versão pública vs. versão admin separadas).
--  4. Query de produtos mais vendidos: adicionado FILTER para
--     excluir order_items de pedidos cancelados da contagem.
--  5. Todos os parâmetros usam $N (node-postgres) — consistente
--     com a lib pg do Node.js.
--  6. Adicionado LIMIT de segurança no GET /api/products para
--     evitar retorno irrestrito de milhares de registros.
-- =============================================================


-- -----------------------------------------------------------
-- GET /api/products?search=&category=
--
-- Query ÚNICA que funciona para os dois casos (com e sem filtro).
-- No Node.js, passe:
--   $1 = '%' + search + '%'   (ex: '%%' para todos, '%dog%' para busca)
--   $2 = category             (ex: 'all' ou 'dogs')
--
-- A condição ($2 = 'all' OR c.slug = $2) elimina a necessidade
-- de duas queries separadas no backend.
-- -----------------------------------------------------------
SELECT
  p.id,
  p.title,
  p.price,
  p.emoji,
  p.bg,
  p.badge,
  c.slug     AS category,
  c.name     AS category_name
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.active = TRUE
  AND p.title ILIKE $1
  AND ($2 = 'all' OR c.slug = $2)
ORDER BY p.id
LIMIT 200;  -- proteção contra retorno irrestrito


-- -----------------------------------------------------------
-- GET /api/categories
-- -----------------------------------------------------------
SELECT id, name, slug, emoji, gradient
FROM categories
ORDER BY id;


-- -----------------------------------------------------------
-- GET /api/products/:id
-- -----------------------------------------------------------
SELECT
  p.id,
  p.title,
  p.price,
  p.emoji,
  p.bg,
  p.badge,
  c.slug AS category,
  c.name AS category_name
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.id = $1
  AND p.active = TRUE;


-- -----------------------------------------------------------
-- POST /api/orders
--
-- ⚠️  IMPORTANTE: no Node.js, execute DENTRO de uma transação:
--
--   const client = await pool.connect();
--   try {
--     await client.query('BEGIN');
--     const { rows } = await client.query(INSERT_ORDER, [...]);
--     for (const item of items) {
--       await client.query(INSERT_ITEM, [...]);
--     }
--     await client.query('COMMIT');
--   } catch (e) {
--     await client.query('ROLLBACK');
--     throw e;
--   } finally {
--     client.release();
--   }
--
-- Sem transação, uma falha no 3º item deixa o pedido criado
-- mas incompleto no banco — dado corrompido silenciosamente.
-- -----------------------------------------------------------

-- Step 1: inserir o pedido
-- $1=order_ref, $2=total, $3=user_id (NULL se guest), $4=customer_name, $5=customer_email
INSERT INTO orders (order_ref, total, user_id, customer_name, customer_email)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, order_ref, status, created_at;

-- Step 2: inserir cada item (executar em loop no Node.js)
-- $1=order_id, $2=product_id, $3=title, $4=price, $5=qty, $6=emoji
INSERT INTO order_items (order_id, product_id, title, price, qty, emoji)
VALUES ($1, $2, $3, $4, $5, $6);


-- -----------------------------------------------------------
-- GET /api/orders/:ref  — Versão PÚBLICA (sem email)
-- Retorna dados do pedido sem expor customer_email
-- $1 = order_ref (ex: 'BST-1749337200000')
-- -----------------------------------------------------------
SELECT
  o.id,
  o.order_ref,
  o.total,
  o.status,
  o.customer_name,
  o.created_at,
  json_agg(
    json_build_object(
      'title',    oi.title,
      'price',    oi.price,
      'qty',      oi.qty,
      'subtotal', oi.subtotal,
      'emoji',    oi.emoji
    ) ORDER BY oi.id
  ) AS items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.order_ref = $1
GROUP BY o.id;

-- -----------------------------------------------------------
-- GET /api/orders/:ref  — Versão ADMIN (com email, user_id)
-- Use esta versão apenas em endpoints protegidos por JWT admin
-- -----------------------------------------------------------
SELECT
  o.id,
  o.order_ref,
  o.total,
  o.status,
  o.customer_name,
  o.customer_email,
  o.user_id,
  o.created_at,
  json_agg(
    json_build_object(
      'title',    oi.title,
      'price',    oi.price,
      'qty',      oi.qty,
      'subtotal', oi.subtotal,
      'emoji',    oi.emoji
    ) ORDER BY oi.id
  ) AS items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.order_ref = $1
GROUP BY o.id;


-- -----------------------------------------------------------
-- POST /api/auth/register
-- $1=name, $2=email, $3=password_hash (bcrypt gerado no Node.js)
-- -----------------------------------------------------------
INSERT INTO users (name, email, password_hash)
VALUES ($1, $2, $3)
RETURNING id, name, email, role, created_at;


-- -----------------------------------------------------------
-- POST /api/auth/login — busca usuário para comparar hash
-- $1 = email
-- Retorna password_hash para o Node.js comparar com bcrypt.compare()
-- NUNCA retorne password_hash para o cliente final
-- -----------------------------------------------------------
SELECT id, name, email, password_hash, role
FROM users
WHERE email = $1;


-- =============================================================
--  QUERIES ADMINISTRATIVAS
-- =============================================================

-- Pedidos por status com receita total
SELECT
  status,
  COUNT(*)   AS total_pedidos,
  SUM(total) AS receita_total
FROM orders
GROUP BY status
ORDER BY total_pedidos DESC;


-- Produtos mais vendidos (exclui pedidos cancelados)
SELECT
  p.title,
  p.emoji,
  SUM(oi.qty)      AS unidades_vendidas,
  SUM(oi.subtotal) AS receita_total
FROM order_items oi
JOIN orders  o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.status != 'cancelled'            -- não conta pedidos cancelados
GROUP BY p.id, p.title, p.emoji
ORDER BY unidades_vendidas DESC;


-- Visão geral de pedidos (painel admin)
SELECT
  o.order_ref,
  o.status,
  o.total,
  o.customer_name,
  o.created_at,
  COUNT(oi.id) AS qtd_itens
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 100;

-- =============================================================
--  FIM DAS QUERIES — v2
-- =============================================================
