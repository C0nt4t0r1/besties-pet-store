# Besties Pet Store 🐾

Projeto completo de e-commerce para pet shop — **Frontend React + Backend Express + PostgreSQL**.

---

## Estrutura do Repositório

```
besties-pet-store/
│
├── backend/                         ← API REST (Node.js + Express)
│   ├── server.js                    ← Todos os endpoints
│   ├── package.json
│   ├── .env.example                 ← Copie para .env e preencha
│   └── .gitignore
│
├── database/                        ← Scripts SQL (PostgreSQL)
│   ├── 001_schema.sql               ← Cria tabelas, índices e triggers
│   ├── 002_seed.sql                 ← Insere categorias e produtos
│   └── 003_queries.sql              ← Queries de referência
│
├── public/
│   └── favicon.svg
│
├── src/                             ← Frontend React (TypeScript)
│   ├── components/
│   │   ├── AnnouncementBanner.tsx
│   │   ├── BrandsSection.tsx
│   │   ├── CartSidebar.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductsSection.tsx
│   │   └── Toast.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── data/
│   │   ├── api.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   └── useDebounce.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── postcss.config.js
```

---

## Como Rodar

### 1. Banco de Dados

```bash
# Criar o banco
psql -U postgres -c "CREATE DATABASE besties_db;"

# Criar as tabelas
psql -U postgres -d besties_db -f database/001_schema.sql

# Inserir dados iniciais
psql -U postgres -d besties_db -f database/002_seed.sql
```

> **Supabase (alternativa gratuita):** crie um projeto em supabase.com, cole os dois arquivos SQL no SQL Editor e copie a Connection String para o `.env` do backend.

---

### 2. Backend

```bash
cd backend
cp .env.example .env      # preencha DATABASE_URL e JWT_SECRET
npm install
npm run dev               # roda em http://localhost:3001
```

---

### 3. Frontend

```bash
# na raiz do repositório
npm install
npm run dev               # roda em http://localhost:5173
```

O Vite proxy redireciona `/api/*` automaticamente para o backend. Se o backend estiver offline, a loja funciona com dados mock locais.

---

## Endpoints da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/health` | — | Saúde do servidor |
| POST | `/api/auth/register` | — | Cadastro de usuário |
| POST | `/api/auth/login` | — | Login — retorna JWT |
| GET | `/api/categories` | — | Lista categorias |
| GET | `/api/products` | — | Lista produtos (filtros: search, category) |
| GET | `/api/products/:id` | — | Produto por ID |
| POST | `/api/orders` | — | Cria pedido |
| GET | `/api/orders/:ref` | — | Pedido por referência |
| GET | `/api/orders` | Admin | Lista todos os pedidos |
| PATCH | `/api/orders/:ref/status` | Admin | Atualiza status |
| POST | `/api/categories` | Admin | Cria categoria |
| PUT | `/api/categories/:id` | Admin | Atualiza categoria |
| DELETE | `/api/categories/:id` | Admin | Remove categoria |
| PUT | `/api/products/:id` | Admin | Atualiza produto |
| DELETE | `/api/products/:id` | Admin | Desativa produto |

---

## Variáveis de Ambiente — `backend/.env`

```env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/besties_db
PORT=3001
JWT_SECRET=string_aleatoria_longa_aqui_minimo_32_chars
NODE_ENV=development
```
