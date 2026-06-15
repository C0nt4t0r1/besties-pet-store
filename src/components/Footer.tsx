import { useState } from "react";
import { MapPin, Phone, Facebook, Youtube, Instagram, Check } from "lucide-react";
import { CORAL, DARK } from "../data/constants";

interface FooterProps {
  onCategory: (cat: string) => void;
}

export function Footer({ onCategory }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer id="contact" style={{ background: CORAL }} className="pt-12 pb-6 px-6">
      <div
        className="max-w-screen-xl mx-auto"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 40 }}
      >
        {/* Coluna 1: Endereço */}
        <div className="text-white">
          <h3 className="font-black text-base uppercase tracking-widest mb-4">
            Nossa Loja
          </h3>
          <div
            className="flex items-start gap-2 text-sm mb-3"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <MapPin size={13} className="text-white flex-shrink-0" />
            <p>
              Rua dos Pets, 123, Centro
              <br />
              São Paulo, SP 01001-000
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-sm mb-4"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <Phone size={13} className="text-white flex-shrink-0" />
            <span>(11) 3456-7890</span>
          </div>
          <a
            href="#"
            className="text-sm font-bold text-white"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}
          >
            Ver todas as lojas →
          </a>
        </div>

        {/* Coluna 2: Categorias */}
        <div className="text-white">
          <h3 className="font-black text-base uppercase tracking-widest mb-4">
            Categorias
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
            {["Dogs", "Cats", "Birds", "Fish & Aquatics", "Small Animals", "Reptiles"].map(
              (c) => (
                <li key={c}>
                  <button
                    onClick={() =>
                      onCategory(
                        c.toLowerCase().replace(/ & /g, "").replace(/ /g, "-")
                      )
                    }
                    className="hover:text-white transition-colors font-medium text-left"
                  >
                    {c}
                  </button>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Coluna 3: Links informativos */}
        <div className="text-white">
          <h3 className="font-black text-base uppercase tracking-widest mb-4">
            Informações
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
            {[
              "Nossa História",
              "Contato",
              "Envio & Devoluções",
              "FAQ",
              "Política de Privacidade",
              "Termos de Serviço",
            ].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-white transition-colors font-medium">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 4: Newsletter */}
        <div className="text-white">
          <h3 className="font-black text-base uppercase tracking-widest mb-2">
            Ofertas Exclusivas
          </h3>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
            Cadastre-se e receba descontos especiais!
          </p>

          {subscribed ? (
            <div className="flex items-center gap-2 text-sm font-black">
              <Check size={16} /> Obrigado! Você está na lista. 🐾
            </div>
          ) : (
            <div className="flex gap-2 mb-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="Seu e-mail..."
                className="flex-1 bg-white text-gray-900 px-3 py-2 text-sm rounded outline-none font-medium"
                style={{ minWidth: 0 }}
              />
              <button
                onClick={handleSubscribe}
                style={{ background: DARK }}
                className="text-white px-4 py-2 text-xs font-black tracking-wider rounded hover:opacity-80 transition-opacity flex-shrink-0"
              >
                OK
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            {[Facebook, Youtube, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <Icon size={15} className="text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé inferior */}
      <div
        className="max-w-screen-xl mx-auto mt-8 pt-5 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
      >
        <p className="text-white font-black tracking-wider">BESTIES 🐾</p>
        <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
          © 2026 Besties Pet Store. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
