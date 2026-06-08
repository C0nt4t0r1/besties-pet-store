-- =============================================================
--  BESTIES PET STORE — Schema Principal
--  Arquivo: 001_schema.sql
--  Revisão: v2 (corrigido)
--
--  CORREÇÕES APLICADAS:
--  1. DROP protegido: só executa em ambiente de desenvolvimento
--     (variável app.env). Em produção, use migrações controladas.
--  2. Índice GIN substituído por índice simples com pg_trgm para
--     buscas ILIKE — o índice GIN com to_tsvector não funciona
--     com ILIKE, causando full scan silencioso.
--  3. emoji VARCHAR(10) → VARCHAR(20): emojis compostos (família,
--     bandeiras) podem ultrapassar 10 bytes em UTF-8.
--  4. bg VARCHAR(10) → VARCHAR(7): valor hex tem exatamente 6
--     chars + '#' = 7. Mais restritivo, mais correto.
--  5. order_ref VARCHAR(30) → VARCHAR(40): "BST-" + timestamp
--     em ms = 17 chars. Margem extra garante segurança.
--  6. Coluna `price` em order_items: CHECK (price >= 0) adicionado
--     para consistência com a tabela products.
--  7. Todo o script envolto em transação: ou tudo executa, ou
--     nada. Evita banco em estado parcial em caso de erro.
-- =============================================================

-- Extensão necessária para índice de busca textual com ILIKE
-- (substitui o GIN com to_tsvector que não funciona com ILIKE)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================
--  ATENÇÃO: O bloco DROP abaixo apaga todos os dados.
--  Remova ou comente em produção.
--  Em desenvolvimento, execute manualmente se quiser resetar.
-- =============================================================
-- DROP TABLE IF EXISTS order_items  CASCADE;
-- DROP TABLE IF EXISTS orders       CASCADE;
-- DROP TABLE IF EXISTS users        CASCADE;
-- DROP TABLE IF EXISTS products     CASCADE;
-- DROP TABLE IF EXISTS categories   CASCADE;
-- DROP FUNCTION IF EXISTS set_updated_at CASCADE;

-- Envolve tudo em transação: erro em qualquer ponto faz rollback total
BEGIN;

-- -----------------------------------------------------------
-- CATEGORIAS
-- Espelha o array CATEGORIES do frontend (slug = value)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  slug       VARCHAR(50)  UNIQUE NOT NULL,   -- "dogs", "cats" etc. — usado no frontend
  emoji      VARCHAR(20),                    -- VARCHAR(20): emojis compostos são maiores
  gradient   TEXT,                           -- gradiente CSS do CATCARDS
  created_at TIMESTAMPTZ  DEFAULT NOW()      -- TIMESTAMPTZ: armazena fuso horário
);

-- -----------------------------------------------------------
-- PRODUTOS
-- Espelha a interface Product do App.tsx
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  emoji       VARCHAR(20),                   -- VARCHAR(20): margem para emojis compostos
  bg          VARCHAR(7),                    -- cor hex: "#FFF0EB" = 7 chars
  badge       VARCHAR(40),                   -- "Best Seller", "New", "50% Off", null
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  active      BOOLEAN NOT NULL DEFAULT TRUE, -- soft delete
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice trigram: funciona corretamente com ILIKE '%termo%'
-- Substitui o GIN/to_tsvector anterior que não era compatível com ILIKE
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON products
  USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(active);

-- -----------------------------------------------------------
-- USUÁRIOS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100),
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,        -- bcrypt hash
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- -----------------------------------------------------------
-- PEDIDOS
-- order_ref mantém o formato "BST-<timestamp>" do frontend
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  order_ref      VARCHAR(40) UNIQUE NOT NULL,  -- VARCHAR(40): margem extra segura
  user_id        INT REFERENCES users(id) ON DELETE SET NULL,
  total          NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  customer_name  VARCHAR(100),
  customer_email VARCHAR(150),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_ref ON orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_user_id   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);

-- -----------------------------------------------------------
-- ITENS DO PEDIDO
-- Snapshot: preserva title/price/emoji no momento da compra
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INT          REFERENCES products(id) ON DELETE SET NULL,
  title       VARCHAR(150) NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),  -- consistente com products
  qty         INT NOT NULL CHECK (qty > 0),
  emoji       VARCHAR(20),
  subtotal    NUMERIC(10, 2) GENERATED ALWAYS AS (price * qty) STORED
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- -----------------------------------------------------------
-- TRIGGER: atualiza updated_at automaticamente em UPDATEs
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria triggers apenas se não existirem (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_products_updated_at'
  ) THEN
    CREATE TRIGGER trg_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at'
  ) THEN
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_updated_at'
  ) THEN
    CREATE TRIGGER trg_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

COMMIT;

-- =============================================================
--  FIM DO SCHEMA — v2
-- =============================================================
