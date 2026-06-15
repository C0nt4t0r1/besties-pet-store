import { Truck } from "lucide-react";
import { TEAL } from "../data/constants";

export function AnnouncementBanner() {
  return (
    <div style={{ background: TEAL }} className="py-2 text-center">
      <div className="flex items-center justify-center gap-3">
        <Truck size={13} className="text-white opacity-80" />
        <span className="text-white text-xs font-black tracking-widest uppercase">
          FRETE GRÁTIS — COMPRE HOJE
        </span>
        <Truck size={13} className="text-white opacity-80" />
      </div>
    </div>
  );
}
