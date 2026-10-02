export const money = (cents) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
export function normalizeCart(cart, products) {
  if (!Array.isArray(cart)) return [];
  const result = [];
  for (const row of cart) {
    const p = products.find((p) => p.id === row?.id);
    if (
      !p ||
      !p.sizes.includes(row.size) ||
      !Number.isInteger(row.qty) ||
      row.qty < 1
    )
      continue;
    const used = result
      .filter((r) => r.id === p.id)
      .reduce((s, r) => s + r.qty, 0);
    const qty = Math.min(row.qty, p.stock - used);
    if (qty > 0) {
      const existing = result.find((r) => r.id === p.id && r.size === row.size);
      if (existing) existing.qty += qty;
      else result.push({ id: p.id, size: row.size, qty });
    }
  }
  return result;
}
export function addItem(cart, product, size, qty = 1) {
  const used = cart
    .filter((r) => r.id === product.id)
    .reduce((s, r) => s + r.qty, 0);
  const amount = Math.min(Math.max(0, Math.floor(qty)), product.stock - used);
  if (!product.sizes.includes(size) || !Number.isFinite(amount) || amount <= 0)
    return cart;
  const found = cart.some((r) => r.id === product.id && r.size === size);
  return found
    ? cart.map((r) =>
        r.id === product.id && r.size === size
          ? { ...r, qty: r.qty + amount }
          : r,
      )
    : [...cart, { id: product.id, size, qty: amount }];
}
export function totals(cart, products, coupon = "", delivery = "standard") {
  const subtotal = cart.reduce(
    (s, r) => s + (products.find((p) => p.id === r.id)?.price || 0) * r.qty,
    0,
  );
  const discount = coupon === "GEEK15" ? Math.round(subtotal * 0.15) : 0;
  const shipping =
    subtotal === 0
      ? 0
      : delivery === "express"
        ? 2990
        : subtotal >= 19900
          ? 0
          : 1590;
  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
  };
}
export const validCep = (value) => /^\d{8}$/.test(value.replace(/\D/g, ""));
export function readStored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
