# Besties Pet Store 🐾 — Frontend React

Frontend em **React + TypeScript + Vite + Tailwind CSS** para a API do projeto integrador.

## Estrutura do projeto

```
besties-pet-store/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/          # Componentes visuais isolados
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
│   │   └── CartContext.tsx   # Estado global do carrinho
│   ├── data/
│   │   ├── api.ts            # Chamadas ao backend (com fallback mock)
│   │   └── constants.ts      # Tokens, tipos, dados estáticos
│   ├── hooks/
│   │   └── useDebounce.ts
│   ├── App.tsx               # Componente raiz
│   ├── index.css             # Estilos globais + Tailwind
│   └── main.tsx              # Ponto de entrada
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Como rodar

### Pré-requisito: Node.js 18+

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

O Vite proxy redireciona `/api/*` automaticamente para `http://localhost:3001` (o backend Express). Se o backend não estiver rodando, a aplicação funciona com dados mock locais.

### 3. Build para produção

```bash
npm run build
```

## Integração com o backend

O arquivo `src/data/api.ts` faz requisições para `/api/products` e `/api/orders`.

- **Com backend rodando**: busca produtos e cria pedidos no PostgreSQL.
- **Sem backend**: usa o `PRODUCTS_DB` local como fallback e simula o checkout.

## Variáveis de ambiente

Copie `.env.example` para `.env` se quiser customizar a URL do backend em produção:

```bash
cp .env.example .env
```
