-- =============================================================
-- BESTIES PET STORE — Seed de dados
-- Arquivo: database/002_seed.sql
-- Execute DEPOIS do 001_schema.sql.
-- Idempotente: pode rodar várias vezes sem duplicar dados.
-- =============================================================

BEGIN;

-- -----------------------------------------------------------
-- CATEGORIAS
-- slugs espelham os "value" do CATEGORIES em constants.ts
-- -----------------------------------------------------------
INSERT INTO categories (name, slug, emoji, gradient) VALUES
  ('Dogs',          'dogs',         '🐕',   'linear-gradient(155deg,#6b3a0a 0%,#c4891d 100%)'),
  ('Cats',          'cats',         '🐈',   'linear-gradient(155deg,#3b0d6e 0%,#8b3dc4 100%)'),
  ('Birds',         'birds',        '🦜',   'linear-gradient(155deg,#083060 0%,#1669b8 100%)'),
  ('Fish',          'fish',         '🐠',   'linear-gradient(155deg,#043328 0%,#0a7055 100%)'),
  ('Small Animals', 'small-animals','🐹',   'linear-gradient(155deg,#4a1200 0%,#a03a08 100%)'),
  ('Reptiles',      'reptiles',     '🦎',   'linear-gradient(155deg,#0f3020 0%,#1d7042 100%)')
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------
-- PRODUTOS
-- Espelha o PRODUCTS_DB de src/data/constants.ts
-- -----------------------------------------------------------
INSERT INTO products (title, price, emoji, bg, badge, category_id) VALUES
  ('Premium Dog Food',   89.90, '🐾', '#FFF0EB', 'Best Seller', (SELECT id FROM categories WHERE slug='dogs')),
  ('Cat Treats Deluxe',  16.99, '😺', '#F0EBFF', NULL,          (SELECT id FROM categories WHERE slug='cats')),
  ('Bird Seed Mix',      24.50, '🌾', '#EBF0FF', 'New',         (SELECT id FROM categories WHERE slug='birds')),
  ('Aquarium Flakes',    18.75, '🐟', '#EBF8FF', NULL,          (SELECT id FROM categories WHERE slug='fish')),
  ('Hamster Pellets',    12.99, '🐹', '#FFF5EB', NULL,          (SELECT id FROM categories WHERE slug='small-animals')),
  ('Reptile Heat Lamp', 145.00, '🦎', '#EBFFEF', 'Pro',         (SELECT id FROM categories WHERE slug='reptiles')),
  ('Dog Dental Chews',   35.90, '🦴', '#FFF0EB', '50% Off',     (SELECT id FROM categories WHERE slug='dogs')),
  ('Premium Cat Litter', 42.99, '🏠', '#F0EBFF', NULL,          (SELECT id FROM categories WHERE slug='cats')),
  ('Puppy Shampoo',      29.90, '🛁', '#FFF0EB', NULL,          (SELECT id FROM categories WHERE slug='dogs')),
  ('Feather Cat Toy',    19.99, '🪶', '#F0EBFF', 'New',         (SELECT id FROM categories WHERE slug='cats')),
  ('Retractable Leash',  55.00, '🦮', '#FFF0EB', NULL,          (SELECT id FROM categories WHERE slug='dogs')),
  ('Aquarium Decor Set', 38.99, '🪸', '#EBF8FF', NULL,          (SELECT id FROM categories WHERE slug='fish'))
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------
-- USUÁRIO ADMIN
-- Gere o hash ANTES de rodar este seed:
--
--   node -e "require('bcrypt').hash('SUA_SENHA',12).then(h=>console.log(h))"
--
-- Depois descomente e substitua <HASH_AQUI> pelo resultado.
-- -----------------------------------------------------------
-- INSERT INTO users (name, email, password_hash, role) VALUES
--   ('Admin', 'admin@besties.com', '<HASH_AQUI>', 'admin')
-- ON CONFLICT (email) DO NOTHING;

COMMIT;

-- =============================================================
-- Verificação rápida (opcional — rode manualmente no psql)
-- =============================================================
-- SELECT p.title, p.price, p.badge, c.slug AS category
-- FROM products p
-- JOIN categories c ON c.id = p.category_id
-- ORDER BY p.id;
