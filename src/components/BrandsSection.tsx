import { BRANDS, CORAL } from "../data/constants";

export function BrandsSection() {
  return (
    <section id="brands" style={{ background: "#F4F4F4" }} className="py-12 px-6">
      <div className="max-w-screen-xl mx-auto text-center">
        <p
          className="text-xs font-black tracking-widest uppercase mb-2"
          style={{ color: CORAL }}
        >
          Aprovado pelos tutores
        </p>
        <h2 className="text-2xl font-black mb-8" style={{ color: CORAL }}>
          Melhores Marcas pelo Menor Preço
        </h2>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {BRANDS.map((b) => (
            <span
              key={b}
              className="font-black text-lg tracking-widest uppercase cursor-pointer transition-colors hover:text-gray-500"
              style={{ color: "#d0d0d0", letterSpacing: "0.15em" }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
