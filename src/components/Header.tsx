import { Search, Phone } from "lucide-react";
import { CORAL } from "../data/constants";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export function Header({ searchQuery, onSearchChange, onSearch }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span
              style={{ color: CORAL, letterSpacing: "0.06em" }}
              className="text-3xl font-black"
            >
              BESTIES
            </span>
            <span className="text-2xl">🐾</span>
          </div>
          <p
            className="text-gray-400 font-bold tracking-widest uppercase"
            style={{ fontSize: "10px" }}
          >
            O Lugar Favorito do seu Pet
          </p>
        </div>

        {/* Barra de busca */}
        <div className="flex flex-1 items-center max-w-lg mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Buscar produtos, marcas..."
            className="flex-1 border-2 border-gray-200 rounded-l-full pl-5 pr-3 py-2 text-sm font-medium outline-none"
            style={{ borderRight: "none" }}
          />
          <button
            onClick={onSearch}
            style={{ background: CORAL }}
            className="px-5 py-2 text-white rounded-r-full flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <Search size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* Telefone */}
        <a
          href="tel:1134567890"
          style={{ background: CORAL }}
          className="flex items-center gap-2 text-white px-5 py-2 rounded font-black text-sm whitespace-nowrap hover:opacity-90 transition-opacity"
        >
          <Phone size={14} />
          (11) 3456-7890
        </a>
      </div>
    </header>
  );
}
