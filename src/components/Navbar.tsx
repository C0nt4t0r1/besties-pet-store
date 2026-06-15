import { ShoppingCart, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { CATEGORIES, CORAL } from "../data/constants";

interface NavbarProps {
  active: string;
  onCategory: (cat: string) => void;
  onCartOpen: () => void;
}

export function Navbar({ active, onCategory, onCartOpen }: NavbarProps) {
  const { count } = useCart();

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
      <div className="max-w-screen-xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Links de categoria */}
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategory(cat.value)}
              className="px-3 py-1 text-xs font-black tracking-wider rounded transition-all"
              style={{
                background: active === cat.value ? CORAL : "transparent",
                color: active === cat.value ? "#fff" : "#444",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Ações direita */}
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1 text-xs font-black tracking-wider text-gray-600 hover:text-gray-900 transition-colors">
            <User size={14} /> LOGIN
          </button>
          <button
            onClick={onCartOpen}
            className="flex items-center gap-1 text-xs font-black tracking-wider text-gray-600 hover:text-gray-900 transition-colors relative"
          >
            <span className="relative">
              <ShoppingCart size={17} />
              {count > 0 && (
                <span
                  className="absolute text-white font-black rounded-full flex items-center justify-center"
                  style={{
                    background: CORAL,
                    top: "-10px",
                    right: "-10px",
                    minWidth: "16px",
                    height: "16px",
                    fontSize: "9px",
                    padding: "0 3px",
                  }}
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </span>
            CARRINHO
          </button>
        </div>
      </div>
    </nav>
  );
}
