import { useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Product, CORAL, DARK, brl } from "../data/constants";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div
      className="product-card bg-white rounded-xl overflow-hidden flex flex-col"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
    >
      {/* Imagem (emoji) */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 152, background: product.bg }}
      >
        {product.badge && (
          <span
            className="absolute top-2 left-2 text-white font-black rounded-full px-2"
            style={{
              background: CORAL,
              fontSize: "9px",
              letterSpacing: "0.05em",
              paddingTop: 2,
              paddingBottom: 2,
            }}
          >
            {product.badge}
          </span>
        )}

        <span className="select-none" style={{ fontSize: 60, lineHeight: 1 }}>
          {product.emoji}
        </span>

        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all"
          style={{ opacity: 0.9 }}
        >
          <Heart
            size={13}
            fill={liked ? CORAL : "none"}
            style={{ color: liked ? CORAL : "#bbb" }}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p
          className="text-center font-medium text-gray-400 mb-1"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {product.category.replace(/-/g, " ")}
        </p>
        <h3 className="text-sm font-black text-gray-900 text-center mb-2 leading-tight">
          {product.title}
        </h3>
        <p className="text-lg font-black text-center mb-4" style={{ color: CORAL }}>
          {brl(product.price)}
        </p>
        <button
          onClick={handleAdd}
          className="w-full mt-auto py-2 text-xs font-black tracking-widest rounded flex items-center justify-center gap-1 transition-all"
          style={{
            background: added ? "#16a34a" : DARK,
            color: "#fff",
          }}
        >
          {added ? (
            <>
              <Check size={12} /> ADICIONADO!
            </>
          ) : (
            <>
              <ShoppingCart size={12} /> ADICIONAR
            </>
          )}
        </button>
      </div>
    </div>
  );
}
