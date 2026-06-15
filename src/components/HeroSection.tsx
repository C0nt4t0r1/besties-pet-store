import { Star, Facebook, Youtube, Instagram } from "lucide-react";
import { CORAL, TEAL, DARK } from "../data/constants";

interface HeroSectionProps {
  onShop: () => void;
  onBrands: () => void;
}

export function HeroSection({ onShop, onBrands }: HeroSectionProps) {
  return (
    <section className="bg-white py-20 px-6 overflow-hidden relative">
      {/* Círculos decorativos */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          background: CORAL,
          opacity: 0.06,
          width: 420,
          height: 420,
          right: "-80px",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          background: TEAL,
          opacity: 0.05,
          width: 260,
          height: 260,
          right: "160px",
          bottom: "-80px",
        }}
      />

      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Texto principal */}
        <div className="max-w-xl">
          <p
            className="text-xs font-black tracking-widest uppercase mb-4"
            style={{ color: CORAL }}
          >
            🐾 Seu pet merece o melhor
          </p>
          <h1
            className="text-6xl font-black mb-6"
            style={{ color: DARK, lineHeight: 1.05 }}
          >
            Bem-vindo à<br />
            Nossa{" "}
            <span style={{ color: CORAL }}>Loja Pet</span>
            <br />Online.
          </h1>
          <p
            className="text-gray-500 text-base font-medium mb-8 leading-relaxed"
            style={{ maxWidth: 380 }}
          >
            Tudo o que seus amigos de quatro patas, com penas e com escamas
            precisam — entregue na sua porta.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onShop}
              style={{ background: CORAL }}
              className="text-white px-8 py-3 font-black text-sm tracking-widest rounded hover:opacity-90 transition-opacity"
            >
              COMPRAR AGORA
            </button>
            <button
              onClick={onBrands}
              style={{ border: `2px solid ${DARK}`, color: DARK }}
              className="px-8 py-3 font-black text-sm tracking-widest rounded hover:bg-gray-50 transition-colors"
            >
              VER MARCAS
            </button>
          </div>

          {/* Avaliação */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} fill={CORAL} style={{ color: CORAL }} />
              ))}
            </div>
            <span className="text-sm text-gray-400 font-medium">
              +10.000 pets e tutores felizes
            </span>
          </div>
        </div>

        {/* Mascote */}
        <div
          className="flex flex-col items-center"
          style={{ marginRight: "60px" }}
        >
          <div
            className="text-9xl select-none"
            style={{
              filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.12))",
              lineHeight: 1,
            }}
          >
            🐕
          </div>
          <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-1">
            <span style={{ color: CORAL }} className="font-black text-sm">
              4.9
            </span>
            <span className="text-gray-300 text-xs">|</span>
            <span className="text-gray-400 text-xs font-medium">
              Pet store mais bem avaliada
            </span>
          </div>
        </div>

        {/* Redes sociais */}
        <div className="flex flex-col items-center gap-4 self-center">
          {[
            { Icon: Facebook, href: "#" },
            { Icon: Youtube, href: "#" },
            { Icon: Instagram, href: "#" },
          ].map(({ Icon, href }, idx) => (
            <a
              key={idx}
              href={href}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Icon size={15} style={{ color: "#888" }} />
            </a>
          ))}
          <div style={{ height: 56, width: 1, background: "#e5e7eb" }} />
          <p
            className="text-gray-300 font-black text-xs tracking-widest uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            Siga-nos
          </p>
        </div>
      </div>
    </section>
  );
}
