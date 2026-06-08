-- =============================================================
--  BESTIES PET STORE — Seed de Dados
--  Arquivo: 002_seed.sql
--  Revisão: v2 (corrigido)
--
--  CORREÇÕES APLICADAS:
--  1. Transação: BEGIN/COMMIT garante atomicidade total.
--  2. ON CONFLICT DO NOTHING: seed é idempotente — pode ser
--     re-executado sem gerar erros de chave duplicada.
--  3. Hash do admin removido do seed: inserir um hash placeholder
--     inválido causa falha silenciosa no login. O usuário admin
--     deve ser criado via script Node.js separado (ver comentário).
--  4. Pedido de exemplo movido para bloco separado com comentário
--     explícito — deve ser removido antes de ir para produção.
--  5. bg atualizado para incluir '#' nos valores hex (VARCHAR(7)).
--  6. Emojis corrigidos para corresponder ao PRODUCTSDB original.
-- =============================================================

BEGIN;

-- -----------------------------------------------------------
-- CATEGORIAS
-- ON CONFLICT (slug) DO NOTHING = idempotente, sem erros
-- -----------------------------------------------------------
INSERT INTO categories (name, slug, emoji, gradient) VALUES
  ('Dogs',           'dogs',          '🐕', 'linear-gradient(155deg,#6b3a0a 0%,#c4891d 100%)'),
  ('Cats',           'cats',          '🐈', 'linear-gradient(155deg,#3b0d6e 0%,#8b3dc4 100%)'),
  ('Birds',          'birds',         '🦜', 'linear-gradient(155deg,#083060 0%,#1669b8 100%)'),
  ('Fish & Aquatics','fish',          '🐠', 'linear-gradient(155deg,#043328 0%,#0a7055 100%)'),
  ('Small Animals',  'small-animals', '🐹', 'linear-gradient(155deg,#4a1200 0%,#a03a08 100%)'),
  ('Reptiles',       'reptiles',      '🦎', 'linear-gradient(155deg,#0f3020 0%,#1d7042 100%)')
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------
-- PRODUTOS
-- Fonte: PRODUCTSDB do frontend (App.tsx / BestiesStore.jsx)
-- bg com '#' para corresponder ao VARCHAR(7) do schema
-- ON CONFLICT (title) não existe pois title não é unique —
-- usamos verificação de existência via subquery de controle
-- -----------------------------------------------------------
INSERT INTO products (title, price, emoji, bg, badge, category_id)
SELECT v.title, v.price, v.emoji, v.bg, v.badge,
       (SELECT id FROM categories WHERE slug = v.slug)
FROM (VALUES
  ('Premium Dog Food',   89.90, '🐾', '#FFF0EB', 'Best Seller', 'dogs'),
  ('Dog Dental Chews',   35.90, '🦴', '#FFF0EB', '50% Off',     'dogs'),
  ('Puppy Shampoo',      29.90, '🛁', '#FFF0EB', NULL,          'dogs'),
  ('Retractable Leash',  55.00, '🦮', '#FFF0EB', NULL,          'dogs'),

  ('Cat Treats Deluxe',  16.99, '😺', '#F0EBFF', NULL,          'cats'),
  ('Premium Cat Litter', 42.99, '🏠', '#F0EBFF', NULL,          'cats'),
  ('Feather Cat Toy',    19.99, '🪶', '#F0EBFF', 'New',         'cats'),

  ('Bird Seed Mix',      24.50, '🌾', '#EBF0FF', 'New',         'birds'),

  ('Aquarium Flakes',    18.75, '🐟', '#EBF8FF', NULL,          'fish'),
  ('Aquarium Decor Set', 38.99, '🪸', '#EBF8FF', NULL,          'fish'),

  ('Hamster Pellets',    12.99, '🐹', '#FFF5EB', NULL,          'small-animals'),

  ('Reptile Heat Lamp', 145.00, '🦎', '#EBFFEF', 'Pro',         'reptiles')
) AS v(title, price, emoji, bg, badge, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.title = v.title
);

-- -----------------------------------------------------------
-- USUÁRIO ADMIN
--
-- ⚠️  NÃO inserimos hash aqui para evitar hash placeholder inválido.
--
-- Gere o hash antes de rodar este seed com o comando abaixo
-- no terminal do projeto (requer o pacote bcrypt instalado):
--
--   node -e "
--     const bcrypt = require('bcrypt');
--     bcrypt.hash('SUA_SENHA_AQUI', 12).then(h => {
--       console.log(h);
--     });
--   "
--
-- Depois substitua o valor de :hash_gerado abaixo e descomente:
--
-- INSERT INTO users (name, email, password_hash, role)
-- VALUES ('Admin Besties', 'admin@besties.com', ':hash_gerado', 'admin')
-- ON CONFLICT (email) DO NOTHING;
-- -----------------------------------------------------------


-- -----------------------------------------------------------
-- DADOS DE DEMONSTRAÇÃO (remover antes de ir para produção)
-- -----------------------------------------------------------
INSERT INTO orders (order_ref, total, status, customer_name, customer_email)
VALUES ('BST-1749337200000', 106.89, 'confirmed', 'Cliente Teste', 'teste@email.com')
ON CONFLICT (order_ref) DO NOTHING;

-- Insere itens apenas se o pedido foi inserido agora
INSERT INTO order_items (order_id, product_id, title, price, qty, emoji)
SELECT
  o.id,
  p.id,
  p.title,
  p.price,
  1,
  p.emoji
FROM orders o
JOIN products p ON p.title IN ('Premium Dog Food', 'Cat Treats Deluxe')
WHERE o.order_ref = 'BST-1749337200000'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
  );

COMMIT;

-- =============================================================
--  FIM DO SEED — v2
-- =============================================================
