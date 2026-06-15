-- =============================================================
-- BESTIES PET STORE — Schema Principal
-- Arquivo: database/001_schema.sql
-- Execute PRIMEIRO, antes do seed.
-- =============================================================

-- Extensão para busca textual com ILIKE (índice trigram)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Envolve tudo em transação: erro em qualquer ponto → rollback total
BEGIN;

-- -----------------------------------------------------------
-- CATEGORIAS
-- slug espelha o campo "value" do CATEGORIES do frontend
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  slug       VARCHAR(50)  UNIQUE NOT NULL,
  emoji      VARCHAR(20),
  gradient   TEXT,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- -----------------------------------------------------------
-- PRODUTOS
-- Espelha a interface Product do src/data/constants.ts
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  emoji       VARCHAR(20),
  bg          VARCHAR(7),           -- cor hex: "#FFF0EB" = 7 chars
  badge       VARCHAR(40),          -- "Best Seller", "New", null
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice trigram: funciona corretamente com ILIKE '%termo%'
CREATE INDEX IF NOT EXISTS idx_products_title_trgm
  ON products USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active    ON products(active);

-- -----------------------------------------------------------
-- USUÁRIOS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100),
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- -----------------------------------------------------------
-- PEDIDOS
-- order_ref = "BST-<timestamp>" gerado pelo frontend
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  order_ref      VARCHAR(40) UNIQUE NOT NULL,
  user_id        INT REFERENCES users(id) ON DELETE SET NULL,
  total          NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
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
  id         SERIAL PRIMARY KEY,
  order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT          REFERENCES products(id) ON DELETE SET NULL,
  title      VARCHAR(150) NOT NULL,
  price      NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  qty        INT NOT NULL CHECK (qty > 0),
  emoji      VARCHAR(20),
  subtotal   NUMERIC(10, 2) GENERATED ALWAYS AS (price * qty) STORED
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_products_updated_at') THEN
    CREATE TRIGGER trg_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_updated_at') THEN
    CREATE TRIGGER trg_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

COMMIT;

-- =============================================================
-- FIM DO SCHEMA
-- =============================================================
