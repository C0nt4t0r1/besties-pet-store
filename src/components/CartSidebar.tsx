import { useState } from "react";
import { ShoppingCart, X, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { checkout } from "../data/api";
import { CORAL, brl } from "../data/constants";
import { OrderResult } from "../data/constants";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { cart, removeItem, updateQty, clearCart, total } = useCart();
  const [checking, setChecking] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");

  const handleCheckout = async () => {
    if (!cart.length) return;
    setChecking(true);
    const res = await checkout(cart, custName, custEmail);
    setChecking(false);
    if (res.success) {
      setOrder(res);
      clearCart();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: 9998 }}>
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />

      {/* Painel */}
      <div
        className="relative bg-white flex flex-col shadow-2xl"
        style={{ width: 384, height: "100%" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-black text-lg flex items-center gap-2">
            <ShoppingCart size={18} style={{ color: CORAL }} /> Carrinho
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Estado: pedido confirmado */}
        {order ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check size={30} style={{ color: "#16a34a" }} />
            </div>
            <h3 className="font-black text-xl mb-2">Pedido Realizado! 🎉</h3>
            <p className="text-gray-500 text-sm mb-1">
              Seu pedido foi processado com sucesso!
            </p>
            <p className="text-xs text-gray-400 mb-6 font-mono">
              ID: {order.orderId}
            </p>
            <button
              style={{ background: CORAL }}
              onClick={() => {
                setOrder(null);
                onClose();
              }}
              className="text-white px-8 py-3 font-black text-sm tracking-wider rounded hover:opacity-90 transition-opacity"
            >
              Continuar Comprando
            </button>
          </div>

        ) : cart.length === 0 ? (
          /* Estado: carrinho vazio */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-7xl mb-4" style={{ opacity: 0.25 }}>
              🛒
            </div>
            <p className="text-gray-400 font-bold text-sm">
              Seu carrinho está vazio.
            </p>
            <button
              onClick={onClose}
              className="mt-4 text-sm font-black hover:underline"
              style={{ color: CORAL }}
            >
              Começar a comprar →
            </button>
          </div>

        ) : (
          <>
            {/* Lista de itens */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ border: "1px solid #f0f0f0" }}
                >
                  <div
                    className="rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ width: 52, height: 52, background: item.bg }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <p className="text-sm font-black text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm font-black" style={{ color: CORAL }}>
                      {brl(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded-full bg-gray-100 text-xs font-black flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-black w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded-full bg-gray-100 text-xs font-black flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Rodapé com totais e checkout */}
            <div className="px-5 py-4 border-t" style={{ background: "#fafafa" }}>
              {/* Campos do cliente */}
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none font-medium"
                />
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none font-medium"
                />
              </div>

              {/* Totais */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                <span className="text-sm font-black">{brl(total)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500 font-medium">Frete</span>
                <span className="text-sm font-black text-green-600">GRÁTIS</span>
              </div>
              <div
                className="flex justify-between items-center mb-4 pt-3"
                style={{ borderTop: "1px solid #e5e7eb" }}
              >
                <span className="font-black text-lg">Total</span>
                <span className="font-black text-lg" style={{ color: CORAL }}>
                  {brl(total)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checking}
                style={{ background: CORAL, opacity: checking ? 0.7 : 1 }}
                className="w-full text-white py-3 font-black text-sm tracking-widest rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {checking ? (
                  <>
                    <span className="animate-spin inline-block">⏳</span>{" "}
                    Processando...
                  </>
                ) : (
                  "FINALIZAR COMPRA →"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
