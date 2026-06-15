import { Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { DARK } from "../data/constants";

export function Toast() {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] text-white text-sm font-bold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2"
      style={{ background: DARK }}
    >
      <Check size={15} style={{ color: "#4ade80" }} />
      {toast}
    </div>
  );
}
