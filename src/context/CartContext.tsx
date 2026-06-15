import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, Product } from "../data/constants";

// ── Tipos do contexto ────────────────────────────────────────────────────────
interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  count: number;
  total: number;
  toast: string | null;
}

// ── Criação do contexto ──────────────────────────────────────────────────────
const CartCtx = createContext<CartContextType | null>(null);

export function useCart(): CartContextType {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const addItem = useCallback((product: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      return found
        ? prev.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + 1 } : i
          )
        : [...prev, { ...product, qty: 1 }];
    });
    setToast(`${product.title} adicionado!`);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart((p) => p.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartCtx.Provider
      value={{ cart, addItem, removeItem, updateQty, clearCart, count, total, toast }}
    >
      {children}
    </CartCtx.Provider>
  );
}
