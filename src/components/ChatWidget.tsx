import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { CORAL } from "../data/constants";

interface ChatMsg {
  from: "bot" | "user";
  text: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: "bot", text: "Olá! 🐾 Como posso ajudar você hoje?" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    const msg = input.trim();
    if (!msg) return;
    setMsgs((m) => [...m, { from: "user", text: msg }]);
    setInput("");
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          from: "bot",
          text: `Obrigado pela mensagem! Nossa equipe entrará em contato em breve sobre "${msg}". 🐕`,
        },
      ]);
    }, 900);
  };

  return (
    <div
      className="fixed bottom-6 right-6 flex flex-col items-end gap-3"
      style={{ zIndex: 9990 }}
    >
      {/* Janela do chat */}
      {open && (
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            width: 288,
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            border: "1px solid #f0f0f0",
          }}
        >
          {/* Header */}
          <div
            style={{ background: CORAL }}
            className="px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                🐾
              </div>
              <div>
                <p className="text-white font-black text-sm">BESTIES Chat</p>
                <p
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Online agora
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ color: "rgba(255,255,255,0.7)" }}
              className="hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Mensagens */}
          <div
            className="p-3 space-y-2 overflow-y-auto"
            style={{ height: 200, background: "#f9f9f9" }}
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                className="flex"
                style={{
                  justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  className="max-w-xs px-3 rounded-xl text-xs font-medium"
                  style={
                    m.from === "user"
                      ? {
                          background: CORAL,
                          color: "#fff",
                          paddingTop: 6,
                          paddingBottom: 6,
                        }
                      : {
                          background: "#fff",
                          color: "#333",
                          border: "1px solid #eee",
                          paddingTop: 6,
                          paddingBottom: 6,
                        }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-3 py-2 text-xs font-medium outline-none"
            />
            <button
              onClick={send}
              style={{ background: CORAL }}
              className="px-3 text-white hover:opacity-90 transition-opacity"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ background: CORAL }}
        className="flex items-center gap-2 px-5 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
      >
        <MessageCircle size={17} className="text-white" />
        <span className="text-white font-black text-sm">Fale conosco</span>
      </button>
    </div>
  );
}
