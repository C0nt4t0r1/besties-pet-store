import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import { Toast } from "./components/Toast";
import { AnnouncementBanner } from "./components/AnnouncementBanner";
import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { CategoryGrid } from "./components/CategoryGrid";
import { ProductsSection } from "./components/ProductsSection";
import { BrandsSection } from "./components/BrandsSection";
import { Footer } from "./components/Footer";
import { ChatWidget } from "./components/ChatWidget";
import { CartSidebar } from "./components/CartSidebar";

export default function App() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);

  // Lida com clique em categoria: rola até os produtos
  const handleCategory = (cat: string) => {
    if (cat === "contact") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setActive(cat);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  // Reseta busca e categoria e rola até produtos
  const handleShopAll = () => {
    setActive("all");
    setSearch("");
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <CartProvider>
      <Toast />

      <div className="min-h-screen bg-white">
        <AnnouncementBanner />

        <Header
          searchQuery={search}
          onSearchChange={(val) => {
            setSearch(val);
            setActive("all");
          }}
          onSearch={() =>
            document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <Navbar
          active={active}
          onCategory={handleCategory}
          onCartOpen={() => setCartOpen(true)}
        />

        <HeroSection
          onShop={() =>
            document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
          }
          onBrands={() =>
            document.getElementById("brands")?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <CategoryGrid onCategory={handleCategory} />

        <ProductsSection
          searchQuery={search}
          active={active}
          onShopAll={handleShopAll}
        />

        <BrandsSection />

        <Footer onCategory={handleCategory} />

        <ChatWidget />

        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  );
}
