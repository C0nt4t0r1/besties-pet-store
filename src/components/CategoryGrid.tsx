import { CAT_CARDS, CORAL } from "../data/constants";

interface CategoryGridProps {
  onCategory: (cat: string) => void;
}

export function CategoryGrid({ onCategory }: CategoryGridProps) {
  const rows = [
    { cards: CAT_CARDS.slice(0, 3), cols: 3, h: 260 },
    { cards: CAT_CARDS.slice(3, 5), cols: 2, h: 220 },
    { cards: CAT_CARDS.slice(5, 7), cols: 2, h: 220 },
  ];

  return (
    <section className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="flex flex-col gap-3">
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${row.cols}, 1fr)`,
              gap: "12px",
            }}
          >
            {row.cards.map((card) => (
              <div
                key={card.label}
                onClick={() => onCategory(card.value)}
                className="cat-card relative rounded-xl overflow-hidden cursor-pointer"
                style={{ height: row.h, background: card.grad }}
              >
                {/* Emoji */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="cat-emoji select-none"
                    style={{
                      fontSize: 80,
                      filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
                    }}
                  >
                    {card.emoji}
                  </span>
                </div>

                {/* Gradiente overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)",
                  }}
                />

                {/* Informações no rodapé */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {card.sub && (
                    <p
                      className="font-black text-xs tracking-widest uppercase mb-1"
                      style={{ color: CORAL }}
                    >
                      {card.sub}
                    </p>
                  )}
                  <p
                    className="text-white font-black text-xl mb-3"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
                  >
                    {card.label}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategory(card.value);
                    }}
                    style={{ background: CORAL }}
                    className="text-white px-4 py-1 text-xs font-black tracking-widest rounded hover:opacity-90 transition-opacity"
                  >
                    VER PRODUTOS
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
