# Besties Pet Store — Back-end + Banco de Dados

API REST em Node.js/Express + banco de dados PostgreSQL para o projeto integrador.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `server.js` | API Express com CRUD completo para 3 entidades |
| `package.json` | Dependências Node.js |
| `.env.example` | Modelo das variáveis de ambiente |
| `001_schema.sql` | Cria tabelas, índices, triggers — envolto em transação |
| `002_seed.sql` | Popula o banco com dados do frontend — idempotente |
| `003_queries.sql` | Queries de referência para cada endpoint Express |

---

## Como rodar o back-end

### Pré-requisito: Node.js 18+ instalado

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
# Copie o arquivo de exemplo e preencha com seus dados
cp .env.example .env
```
Edite o `.env` com a URL do seu banco PostgreSQL e uma chave JWT segura.

### 3. Criar e popular o banco (ver seção abaixo)

### 4. Iniciar o servidor
```bash
node server.js
# ou em modo desenvolvimento (reinicia automaticamente):
npx nodemon server.js
```
O servidor sobe em `http://localhost:3001`

---

## Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastra novo usuário |
| POST | `/api/auth/login` | Login — retorna JWT |

### Categorias (Entidade 1)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/categories` | — | Lista todas |
| GET | `/api/categories/:id` | — | Busca por id |
| POST | `/api/categories` | Admin | Cria categoria |
| PUT | `/api/categories/:id` | Admin | Atualiza categoria |
| DELETE | `/api/categories/:id` | Admin | Remove categoria |

### Produtos (Entidade 2)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/products?search=&category=` | — | Lista com filtros |
| GET | `/api/products/:id` | — | Busca por id |
| POST | `/api/products` | Admin | Cadastra produto |
| PUT | `/api/products/:id` | Admin | Atualiza produto |
| DELETE | `/api/products/:id` | Admin | Desativa produto |

### Pedidos (Entidade 3)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/orders` | Admin | Lista pedidos |
| GET | `/api/orders/:ref` | — | Busca por order_ref |
| POST | `/api/orders` | — | Cria pedido com itens |
| PATCH | `/api/orders/:ref/status` | Admin | Atualiza status |
| DELETE | `/api/orders/:ref` | Admin | Remove pedido |

### Outros
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Verifica se o servidor está online |

---

## Como executar o banco de dados

### Pré-requisito: PostgreSQL instalado
Qualquer versão 13+ funciona. Para verificar: `psql --version`

### 1. Criar o banco
```bash
psql -U postgres -c "CREATE DATABASE besties_db;"
```

### 2. Rodar o schema
```bash
psql -U postgres -d besties_db -f 001_schema.sql
```

### 3. Gerar o hash da senha admin (necessário antes do seed)
```bash
# Na pasta raiz do backend (requer bcrypt instalado: npm install bcrypt)
node -e "
  const b = require('bcrypt');
  b.hash('SUA_SENHA_AQUI', 12).then(h => console.log(h));
"
```
Cole o hash gerado no `002_seed.sql`, descomentando o bloco do usuário admin.

### 4. Rodar o seed
```bash
psql -U postgres -d besties_db -f 002_seed.sql
```

### 5. Verificar resultado
```bash
psql -U postgres -d besties_db -c "
  SELECT p.title, p.price, p.badge, c.slug AS category
  FROM products p
  JOIN categories c ON c.id = p.category_id
  ORDER BY p.id;
"
```

---

## Supabase (deploy gratuito — recomendado para apresentação)

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Vá em **SQL Editor** no menu lateral
3. Execute `001_schema.sql`
4. Execute `002_seed.sql` (com hash gerado)
5. Copie a **Connection String** em Settings → Database
6. Cole no `.env` do backend: `DATABASE_URL=postgresql://...`

---

## Variáveis de ambiente do backend

Crie `.env` na raiz do servidor Express:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/besties_db
PORT=3001
JWT_SECRET=string_aleatoria_longa_aqui_minimo_32_chars
NODE_ENV=development
```

---

## Diagrama de tabelas

```
categories
  id | name | slug* | emoji | gradient
              ↑
products
  id | title | price | emoji | bg | badge | category_id | active
                                               ↑
order_items                                    |
  id | order_id → orders.id                    |
     | product_id → products.id ───────────────┘
     | title (snapshot) | price (snapshot)
     | qty | emoji (snapshot)
     | subtotal (gerado: price * qty)
          ↑
orders
  id | order_ref* | user_id → users.id | total | status
                                ↑
users
  id | name | email* | password_hash | role
```
`*` = campo UNIQUE

---

## Changelog v2 (revisão de segurança)

| # | Problema original | Correção aplicada |
|---|---|---|
| 1 | DROP sem proteção apagaria produção | Bloco DROP comentado; schema envolto em `BEGIN/COMMIT` |
| 2 | Índice GIN/tsvector não funciona com `ILIKE` | Substituído por `gin_trgm_ops` via `pg_trgm` |
| 3 | `emoji VARCHAR(10)` trunca emojis compostos | Ampliado para `VARCHAR(20)` |
| 4 | `bg VARCHAR(10)` sem padrão definido | Reduzido para `VARCHAR(7)` (padrão `#RRGGBB`) |
| 5 | `order_ref VARCHAR(30)` sem margem | Ampliado para `VARCHAR(40)` |
| 6 | Hash placeholder inválido no admin seed | Removido; instrução para gerar hash real |
| 7 | Seed sem `ON CONFLICT` causava erro na re-execução | `ON CONFLICT DO NOTHING` em todas as inserções |
| 8 | Duas queries separadas para `GET /api/products` | Unificadas em uma com `($2 = 'all' OR c.slug = $2)` |
| 9 | `POST /api/orders` sem transação = dados corrompidos | Bloco Node.js com `BEGIN/ROLLBACK/COMMIT` documentado |
| 10 | `customer_email` exposto na query pública | Separado em versão pública (sem email) e versão admin |
| 11 | Produtos mais vendidos contava pedidos cancelados | Filtro `WHERE o.status != 'cancelled'` adicionado |
| 12 | `GET /api/products` sem LIMIT | `LIMIT 200` adicionado como proteção |

