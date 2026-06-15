// ── Design Tokens ──────────────────────────────────────────────────────────
export const CORAL = "#FF5A36";
export const TEAL = "#005A60";
export const DARK = "#1A1A1A";

// ── URL base da API ─────────────────────────────────────────────────────────
// Em desenvolvimento, o Vite proxy redireciona /api/* → localhost:3001
export const API_URL = "";

// ── Tipos ───────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  title: string;
  price: number;
  emoji: string;
  bg: string;
  category: string;
  badge: string | null;
}

export interface CartItem extends Product {
  qty: number;
}

export interface OrderResult {
  success: boolean;
  orderId: string;
}

// ── Banco de dados mock (fallback quando API está offline) ──────────────────
export const PRODUCTS_DB: Product[] = [
  { id: 1,  title: "Premium Dog Food",    price: 89.90,  emoji: "🐾", bg: "#FFF0EB", category: "dogs",         badge: "Best Seller" },
  { id: 2,  title: "Cat Treats Deluxe",   price: 16.99,  emoji: "😺", bg: "#F0EBFF", category: "cats",         badge: null          },
  { id: 3,  title: "Bird Seed Mix",       price: 24.50,  emoji: "🌾", bg: "#EBF0FF", category: "birds",        badge: "New"         },
  { id: 4,  title: "Aquarium Flakes",     price: 18.75,  emoji: "🐟", bg: "#EBF8FF", category: "fish",         badge: null          },
  { id: 5,  title: "Hamster Pellets",     price: 12.99,  emoji: "🐹", bg: "#FFF5EB", category: "small-animals",badge: null          },
  { id: 6,  title: "Reptile Heat Lamp",   price: 145.00, emoji: "🦎", bg: "#EBFFEF", category: "reptiles",     badge: "Pro"         },
  { id: 7,  title: "Dog Dental Chews",    price: 35.90,  emoji: "🦴", bg: "#FFF0EB", category: "dogs",         badge: "50% Off"     },
  { id: 8,  title: "Premium Cat Litter",  price: 42.99,  emoji: "🏠", bg: "#F0EBFF", category: "cats",         badge: null          },
  { id: 9,  title: "Puppy Shampoo",       price: 29.90,  emoji: "🛁", bg: "#FFF0EB", category: "dogs",         badge: null          },
  { id: 10, title: "Feather Cat Toy",     price: 19.99,  emoji: "🪶", bg: "#F0EBFF", category: "cats",         badge: "New"         },
  { id: 11, title: "Retractable Leash",   price: 55.00,  emoji: "🦮", bg: "#FFF0EB", category: "dogs",         badge: null          },
  { id: 12, title: "Aquarium Decor Set",  price: 38.99,  emoji: "🪸", bg: "#EBF8FF", category: "fish",         badge: null          },
];

// ── Categorias da navbar ────────────────────────────────────────────────────
export const CATEGORIES = [
  { name: "SHOP ALL",      value: "all"          },
  { name: "DOGS",          value: "dogs"         },
  { name: "CATS",          value: "cats"         },
  { name: "BIRDS",         value: "birds"        },
  { name: "FISH & AQUATICS", value: "fish"       },
  { name: "SMALL ANIMALS", value: "small-animals"},
  { name: "REPTILES",      value: "reptiles"     },
  { name: "CONTATO",       value: "contact"      },
];

// ── Cards de categoria (grid visual) ────────────────────────────────────────
export const CAT_CARDS = [
  { label: "OFERTA DA SEMANA", sub: "50% Off em Dog Treats",  emoji: "🐕",   value: "dogs",         grad: "linear-gradient(155deg,#111 0%,#3a1800 100%)" },
  { label: "Dogs",             sub: null,                      emoji: "🐕‍🦺", value: "dogs",         grad: "linear-gradient(155deg,#6b3a0a 0%,#c4891d 100%)" },
  { label: "Cats",             sub: null,                      emoji: "🐈",   value: "cats",         grad: "linear-gradient(155deg,#3b0d6e 0%,#8b3dc4 100%)" },
  { label: "Birds",            sub: null,                      emoji: "🦜",   value: "birds",        grad: "linear-gradient(155deg,#083060 0%,#1669b8 100%)" },
  { label: "Fish & Aquatics",  sub: null,                      emoji: "🐠",   value: "fish",         grad: "linear-gradient(155deg,#043328 0%,#0a7055 100%)" },
  { label: "Small Animals",    sub: null,                      emoji: "🐹",   value: "small-animals",grad: "linear-gradient(155deg,#4a1200 0%,#a03a08 100%)" },
  { label: "Reptiles",         sub: null,                      emoji: "🦎",   value: "reptiles",     grad: "linear-gradient(155deg,#0f3020 0%,#1d7042 100%)" },
];

// ── Marcas parceiras ────────────────────────────────────────────────────────
export const BRANDS = ["Le Bone", "Furry Friend", "Happy Paws", "Zoo Zoo", "Royals"];

// ── Helper: formata valor em BRL ─────────────────────────────────────────────
export const brl = (n: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
