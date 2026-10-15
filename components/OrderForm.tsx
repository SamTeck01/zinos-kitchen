"use client";
import { useEffect, useMemo, useState } from "react";
import { MENU, WHATSAPP, formatPrice, nextCookDay, fmtDay } from "../data/menu";

type Line = { dishId: string; litres: number; qty: number };
const key = (l: { dishId: string; litres: number }) => `${l.dishId}:${l.litres}`;

export default function OrderForm() {
  const [lines, setLines] = useState<Line[]>([]);
  const [cookDay, setCookDay] = useState<string>("this Saturday");
  const [form, setForm] = useState({ name: "", phone: "", mode: "Delivery", address: "", note: "" });
  useEffect(() => setCookDay(fmtDay(nextCookDay())), []);

  const qtyOf = (dishId: string, litres: number) => lines.find((l) => key(l) === `${dishId}:${litres}`)?.qty ?? 0;
  const bump = (dishId: string, litres: number, d: number) =>
    setLines((prev) => {
      const k = `${dishId}:${litres}`, cur = prev.find((l) => key(l) === k);
      const qty = Math.max(0, (cur?.qty ?? 0) + d);
      const rest = prev.filter((l) => key(l) !== k);
      return qty ? [...rest, { dishId, litres, qty }] : rest;
    });

  const priced = useMemo(() => lines.map((l) => {
    const dish = MENU.find((m) => m.id === l.dishId)!;
    const price = dish.sizes.find((s) => s.litres === l.litres)!.price;
    return { ...l, dish, price, sub: price * l.qty };
  }), [lines]);
  const total = priced.reduce((s, l) => s + l.sub, 0);
  const litres = priced.reduce((s, l) => s + l.litres * l.qty, 0);
  const ready = priced.length > 0 && form.name.trim() && form.phone.trim() && (form.mode === "Pickup" || form.address.trim());

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const msg = [
      `Hi Zino's Kitchen, I'd like to order for ${cookDay}:`, "",
      ...priced.map((l) => `• ${l.qty} × ${l.litres}L ${l.dish.name} — ${formatPrice(l.sub)}`), "",
      `Total: ${formatPrice(total)} (${litres}L)`,
      `Name: ${form.name}`, `Phone: ${form.phone}`, `${form.mode}${form.mode === "Delivery" ? `: ${form.address}` : ""}`,
      form.note && `Note: ${form.note}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  const input = "mt-1 w-full min-h-11 rounded-xl border border-char/15 bg-paper px-3 text-base outline-none focus:border-bq-red";

  return (
    <form onSubmit={send} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        {MENU.map((dish) => (
          <article key={dish.id} className="rounded-3xl bg-blush/60 p-5 sm:p-6">
            <h3 className="font-display text-2xl font-extrabold uppercase text-bq-red">{dish.name}</h3>
            {dish.desc !== undefined && <p className="mt-1 text-sm text-char/70">{dish.desc}</p>}
            <ul className="mt-4 divide-y divide-char/10">
              {dish.sizes.map((s) => {
                const q = qtyOf(dish.id, s.litres);
                return (
                  <li key={s.litres} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <span className="font-display text-xl font-extrabold">{s.litres} LITRE{s.litres > 1 ? "S" : ""}</span>
                      <span className="ml-3 font-mono text-bq-red">{formatPrice(s.price)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" aria-label={`Remove one ${s.litres} litre ${dish.name}`} onClick={() => bump(dish.id, s.litres, -1)} disabled={!q} className="size-11 rounded-full border border-char/20 text-xl disabled:opacity-30">−</button>
                      <span className="w-8 text-center font-mono" aria-live="polite">{q}</span>
                      <button type="button" aria-label={`Add one ${s.litres} litre ${dish.name}`} onClick={() => bump(dish.id, s.litres, 1)} className="size-11 rounded-full bg-bq-red text-xl text-white hover:bg-deep-red">+</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-3xl border border-char/10 bg-white/60 p-5 sm:p-6 lg:sticky lg:top-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-deep-red">Cooking {cookDay}</p>
        <h3 className="mt-1 font-display text-2xl font-extrabold uppercase">Your order</h3>
        {priced.length === 0 ? (
          <p className="mt-3 text-sm text-char/70">Tap + on a size to add it.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {priced.map((l) => (
              <li key={key(l)} className="flex justify-between gap-2"><span>{l.qty} × {l.litres}L {l.dish.name}</span><span className="font-mono">{formatPrice(l.sub)}</span></li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-baseline justify-between border-t border-char/10 pt-3">
          <span className="font-display font-extrabold uppercase">Total · {litres}L</span>
          <span className="font-mono text-2xl text-bq-red">{formatPrice(total)}</span>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <label className="block">Name<input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required /></label>
          <label className="block">Phone<input className={input} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" required /></label>
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-1">Delivery or pickup</legend>
            {["Delivery", "Pickup"].map((m) => (
              <label key={m} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border font-medium ${form.mode === m ? "border-bq-red bg-bq-red text-white" : "border-char/15"}`}>
                <input type="radio" name="mode" value={m} checked={form.mode === m} onChange={() => setForm({ ...form, mode: m })} className="sr-only" />{m}
              </label>
            ))}
          </fieldset>
          {form.mode === "Delivery" && <label className="block">Delivery address<input className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autoComplete="street-address" required /></label>}
          <label className="block">Note (optional)<input className={input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
        </div>

        <button type="submit" disabled={!ready} className="mt-5 min-h-12 w-full rounded-full bg-bq-red font-display text-lg font-extrabold uppercase text-white hover:bg-deep-red disabled:opacity-40">
          Send order on WhatsApp
        </button>
        <p className="mt-2 text-center text-xs text-char/70">Your order opens in WhatsApp, ready to send.</p>
      </aside>
    </form>
  );
}
