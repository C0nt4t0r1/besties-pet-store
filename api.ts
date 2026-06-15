import { CartItem, OrderResult, PRODUCTS_DB, Product } from "./constants";

// Em desenvolvimento: usa proxy do Vite (/api → localhost:3001)
// Em produção: usa a URL completa do backend no Render (VITE_API_URL)
const BASE: string = import.meta.env.VITE_API_URL ?? "";

export async function fetchProducts({
  search = "",
  category = "all",
}: {
  search?: string;
  category?: string;
} = {}): Promise<Product[]> {
  try {
    const params = new URLSearchParams({ search, category });
    const res = await fetch(`${BASE}/api/products?${params}`);
    if (!res.ok) throw new Error("API offline");
    return await res.json();
  } catch {
    await new Promise((r) => setTimeout(r, 300));
    return PRODUCTS_DB.filter((p) => {
      const okSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const okCat = category === "all" || p.category === category;
      return okSearch && okCat;
    });
  }
}

export async function checkout(
  items: CartItem[],
  customerName = "Cliente",
  customerEmail = "cliente@besties.com"
): Promise<OrderResult> {
  const orderRef = `BST-${Date.now()}`;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  try {
    const res = await fetch(`${BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_ref: orderRef,
        total,
        customer_name: customerName,
        customer_email: customerEmail,
        items: items.map((i) => ({
          product_id: i.id,
          title: i.title,
          price: i.price,
          qty: i.qty,
          emoji: i.emoji,
        })),
      }),
    });
    const data = await res.json();
    return { success: res.ok, orderId: data.order_ref || orderRef };
  } catch {
    await new Promise((r) => setTimeout(r, 900));
    return { success: true, orderId: orderRef };
  }
}
