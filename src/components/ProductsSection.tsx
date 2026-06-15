import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { fetchProducts } from "../data/api";
import { Product, CORAL, DARK } from "../data/constants";
import { useDebounce } from "../hooks/useDebounce";

interface ProductsSectionProps {
  searchQuery: string;
  active: string;
  onShopAll: () => void;
}

export function ProductsSection({
  searchQuery,
  active,
  onShopAll,
}: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    setLoading(true);
    setShowAll(false);
    fetchProducts({ search: debouncedSearch, category: active }).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [debouncedSearch, active]);

  const shown = showAll ? products : products.slice(0, 8);

  return (
    <section id="products" className="py-14 px-6" style={{ background: "#F9F9F9" }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <p
            className="text-xs font-black tracking-widest uppercase mb-2"
            style={{ color: CORAL }}
          >
            Selecionados para os seus pets
          </p>
          <h2 className="text-4xl font-black" style={{ color: CORAL }}>
            Escolhas dos Pets
          </h2>
          {(debouncedSearch || active !== "all") && !loading && (
            <p className="text-sm text-gray-400 mt-2">
              {products.length} resultado{products.length !== 1 ? "s" : ""}
              {debouncedSearch ? ` para "${debouncedSearch}"` : ""}
              {active !== "all" ? ` em ${active.replace(/-/g, " ")}` : ""}
            </p>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl animate-pulse"
                style={{ height: 260 }}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 font-bold">Nenhum produto encontrado.</p>
            <button
              onClick={onShopAll}
              className="mt-4 text-sm font-black hover:underline"
              style={{ color: CORAL }}
            >
              Ver todos os produtos →
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Botões ver mais */}
        {!loading && products.length > 8 && (
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={() => setShowAll((v) => !v)}
              style={{ background: DARK }}
              className="text-white px-10 py-3 font-black text-xs tracking-widest rounded hover:opacity-80 transition-opacity"
            >
              {showAll ? "VER MENOS" : "VER MAIS"}
            </button>
            <button
              onClick={onShopAll}
              style={{ background: CORAL }}
              className="text-white px-10 py-3 font-black text-xs tracking-widest rounded hover:opacity-90 transition-opacity"
            >
              TODOS OS PRODUTOS
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
