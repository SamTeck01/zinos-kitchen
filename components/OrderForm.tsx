"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PLATES, PROTEINS, SIDES, WHATSAPP, formatPrice, type Option } from "../data/menu";

type Plate = { size: string; protein: string; sides: string[]; qty: number };
const byId = (list: Option[], id: string) => list.find((o) => o.id === id)!;
const plateTotal = (p: Plate) =>
  byId(PLATES, p.size).price + byId(PROTEINS, p.protein).price + p.sides.reduce((s, id) => s + byId(SIDES, id).price, 0);
const describe = (p: Plate) =>
  [`${byId(PLATES, p.size).name} Jollof Rice`, p.protein !== "none" && byId(PROTEINS, p.protein).name, ...p.sides.map((id) => byId(SIDES, id).name)]
    .filter(Boolean).join(" + ");

/* Where each extra sits on the plate. Percentages of the plate box. */
const SPOT: Record<string, string> = {
  chicken: "left-[6%] top-[10%] rotate-[-8deg]",
  fish: "left-[6%] top-[10%] rotate-[-8deg]",
  beef: "left-[6%] top-[10%] rotate-[-8deg]",
  plantain: "right-[4%] top-[18%] rotate-[6deg]",
  coleslaw: "left-[30%] bottom-[2%] rotate-[3deg]",
};

function Chip({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`press flex min-h-12 items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-[background-color,border-color,color] duration-150 ${
        active ? "border-bq-red bg-bq-red text-white" : "border-char/15 bg-white/70 text-char hover:border-char/40"
      }`}
    >
      {children}
    </button>
  );
}

export default function OrderForm() {
  const [plate, setPlate] = useState<Plate>({ size: "Big Plate", protein: "chicken", sides: ["plantain"], qty: 1 });
  const [cart, setCart] = useState<Plate[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", mode: "Delivery", address: "", note: "" });
  const [pulse, setPulse] = useState(0);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const close = () => { setClosing(true); window.setTimeout(() => { setOpen(false); setClosing(false); }, 200); };
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);
  const count = cart.reduce((n, p) => n + p.qty, 0);

  const unit = plateTotal(plate);
  const total = useMemo(() => cart.reduce((s, p) => s + plateTotal(p) * p.qty, 0), [cart]);
  const toggleSide = (id: string) =>
    setPlate((p) => ({ ...p, sides: p.sides.includes(id) ? p.sides.filter((s) => s !== id) : [...p.sides, id] }));
  const add = () => { setCart((c) => [...c, plate]); setPulse((n) => n + 1); };
  const remove = (i: number) => setCart((c) => { const next = c.filter((_, j) => j !== i); if (!next.length) close(); return next; });
  const ready = cart.length > 0 && form.name.trim() && form.phone.trim() && (form.mode === "Pickup" || form.address.trim());

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const msg = [
      `Hi Zino's Kitchen, I'd like to order:`, "",
      ...cart.map((p) => `• ${p.qty} × ${describe(p)} — ${formatPrice(plateTotal(p) * p.qty)}`), "",
      `Total: ${formatPrice(total)}`,
      `Name: ${form.name}`, `Phone: ${form.phone}`,
      form.mode === "Delivery" ? `Delivery: ${form.address}` : "Pickup",
      form.note && `Note: ${form.note}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  const extras = [plate.protein, ...plate.sides].filter((id) => id !== "none");
  const input = "mt-1 w-full min-h-12 rounded-xl border border-char/15 bg-paper px-3 text-base outline-none transition-[border-color] duration-150 focus:border-bq-red";

  return (
    <div className="mx-auto max-w-3xl">
      {/* ---------- builder ---------- */}
      <div>
        <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* the plate */}
          <div className="relative mx-auto aspect-square w-full max-w-[22rem]" aria-hidden="true">
            <div className="absolute inset-0 rounded-full bg-white shadow-[0_24px_48px_-16px_rgba(165,6,2,0.35),0_4px_10px_rgba(20,16,14,0.08)]" />
            <div className="absolute inset-[6%] rounded-full ring-1 ring-char/5" />
            <div
              className="plate-rice absolute overflow-hidden rounded-[46%_54%_50%_50%/52%_48%_52%_48%]"
              style={{ inset: plate.size === "Big Plate" ? "14%" : "24%" }}
            >
              <Image src="/crops/rice.webp" alt="" fill sizes="300px" className="object-cover" />
            </div>
            {[...PROTEINS, ...SIDES].filter((o) => o.id !== "none").map((o) => {
              const on = extras.includes(o.id);
              return (
                <div
                  key={o.id}
                  className={`plate-item absolute size-[38%] overflow-hidden rounded-[42%_58%_55%_45%/50%_45%_55%_50%] shadow-[0_8px_16px_-6px_rgba(20,16,14,0.45)] ${SPOT[o.id]} ${on ? "is-on" : ""}`}
                >
                  {o.img ? (
                    <Image src={o.img} alt="" fill sizes="160px" className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-deep-red font-display text-lg font-extrabold uppercase text-white">{o.name}</div>
                  )}
                </div>
              );
            })}
            <div className="absolute -right-1 bottom-[6%] rounded-full bg-char px-4 py-2 font-mono text-sm text-white shadow-lg">
              <span key={unit} className="price-tick inline-block">{formatPrice(unit)}</span>
            </div>
          </div>

          {/* the choices */}
          <div className="space-y-6">
            <fieldset>
              <legend className="font-display text-lg font-extrabold uppercase">Jollof rice</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {PLATES.map((r) => (
                  <Chip key={r.id} active={plate.size === r.id} onClick={() => setPlate({ ...plate, size: r.id })}>
                    <span className="flex flex-col leading-tight">
                      <span className="font-display font-extrabold uppercase">{r.name}</span>
                      <span className="font-mono text-xs opacity-80">{formatPrice(r.price)}</span>
                    </span>
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display text-lg font-extrabold uppercase">Add protein</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {PROTEINS.map((p) => (
                  <Chip key={p.id} active={plate.protein === p.id} onClick={() => setPlate({ ...plate, protein: p.id })}>
                    {p.img && <Image src={p.img} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full object-cover" />}
                    <span className="leading-tight">
                      <span className="block text-sm font-medium">{p.name}</span>
                      {p.price > 0 && <span className="font-mono text-xs opacity-80">+{formatPrice(p.price)}</span>}
                    </span>
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display text-lg font-extrabold uppercase">Add sides</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SIDES.map((s) => (
                  <Chip key={s.id} active={plate.sides.includes(s.id)} onClick={() => toggleSide(s.id)}>
                    {s.img && <Image src={s.img} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full object-cover" />}
                    <span className="leading-tight">
                      <span className="block text-sm font-medium">{s.name}</span>
                      <span className="font-mono text-xs opacity-80">+{formatPrice(s.price)}</span>
                    </span>
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-char/15 bg-white/70">
            <button type="button" aria-label="One fewer" onClick={() => setPlate({ ...plate, qty: Math.max(1, plate.qty - 1) })} className="press size-12 rounded-full text-xl">−</button>
            <span className="w-6 text-center font-mono" aria-live="polite">{plate.qty}</span>
            <button type="button" aria-label="One more" onClick={() => setPlate({ ...plate, qty: plate.qty + 1 })} className="press size-12 rounded-full text-xl">+</button>
          </div>
          <button type="button" onClick={add} className="press flex min-h-12 flex-1 items-center justify-between rounded-full bg-bq-red px-6 font-display text-lg font-extrabold uppercase text-white transition-[background-color] duration-150 hover:bg-deep-red">
            <span className="whitespace-nowrap">Add to order</span>
            <span className="font-mono text-base font-normal">{formatPrice(unit * plate.qty)}</span>
          </button>
        </div>
      </div>

      {/* ---------- cart pill ---------- */}
      {count > 0 && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cart-pill press fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.85rem)] z-[55] mx-auto flex min-h-14 max-w-md items-center justify-between rounded-full bg-char px-6 text-white shadow-[0_16px_36px_-12px_rgba(20,16,14,0.6)] hover:bg-deep-red"
        >
          <span className="flex items-center gap-3">
            <span key={pulse} className="cart-bump flex size-8 items-center justify-center rounded-full bg-bq-red font-mono text-sm">{count}</span>
            <span className="font-display text-lg font-extrabold uppercase">View order</span>
          </span>
          <span key={total} className="price-tick font-mono">{formatPrice(total)}</span>
        </button>
      )}

      {/* ---------- checkout modal ---------- */}
      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" data-state={closing ? "closing" : "open"}>
          <button type="button" aria-label="Close order" tabIndex={-1} onClick={close} className="sheet-backdrop absolute inset-0 bg-char/50 backdrop-blur-[2px]" />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-title"
            tabIndex={-1}
            className="sheet relative max-h-[92svh] w-full overflow-y-auto rounded-t-[2rem] bg-blush p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] outline-none sm:max-w-lg sm:rounded-[2rem] sm:p-7"
          >
            <span aria-hidden="true" className="mx-auto -mt-1 mb-3 block h-1.5 w-10 rounded-full bg-char/20 sm:hidden" />
      {/* ---------- checkout ---------- */}
            <form onSubmit={send}>
              <div className="flex items-center justify-between">
                <h3 id="order-title" className="font-display text-2xl font-extrabold uppercase">Your order</h3>
                <button type="button" onClick={close} aria-label="Close" className="press -mr-2 size-11 rounded-full text-xl text-char/60 hover:text-bq-red">✕</button>
              </div>
      
              {cart.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-char/20 p-4 text-sm text-char/70">Build a plate and tap Add to order.</p>
              ) : (
                <ul key={pulse} className="mt-4 space-y-2">
                  {cart.map((p, i) => (
                    <li key={i} className="cart-row flex items-start justify-between gap-3 rounded-2xl bg-paper p-3 text-sm">
                      <span><span className="font-mono">{p.qty}×</span> {describe(p)}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <span className="font-mono">{formatPrice(plateTotal(p) * p.qty)}</span>
                        <button type="button" aria-label={`Remove ${describe(p)}`} onClick={() => remove(i)} className="press -my-2 -mr-2 size-11 rounded-full text-char/60 hover:text-bq-red">✕</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex items-baseline justify-between border-t border-char/15 pt-3">
                <span className="font-display font-extrabold uppercase">Total</span>
                <span className="font-mono text-2xl text-bq-red">{formatPrice(total)}</span>
              </div>
      
              <div className="mt-5 space-y-3 text-sm">
                <label className="block">Name<input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required /></label>
                <label className="block">Phone<input className={input} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" required /></label>
                <fieldset className="grid grid-cols-2 gap-2">
                  <legend className="mb-1">Delivery or pickup</legend>
                  {["Delivery", "Pickup"].map((m) => (
                    <label key={m} className={`press flex min-h-12 cursor-pointer items-center justify-center rounded-xl border font-medium transition-[background-color,color] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bq-red ${form.mode === m ? "border-char bg-char text-white" : "border-char/15 bg-paper"}`}>
                      <input type="radio" name="mode" value={m} checked={form.mode === m} onChange={() => setForm({ ...form, mode: m })} className="sr-only" />{m}
                    </label>
                  ))}
                </fieldset>
                {form.mode === "Delivery" && <label className="block">Delivery address<input className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autoComplete="street-address" required /></label>}
                <label className="block">Note (optional)<input className={input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
              </div>
      
              <button type="submit" disabled={!ready} className="press mt-5 min-h-12 w-full rounded-full bg-bq-red font-display text-lg font-extrabold uppercase text-white transition-[background-color,opacity] duration-150 hover:bg-deep-red disabled:cursor-not-allowed disabled:opacity-40">
                Send order on WhatsApp
              </button>
              <p className="mt-2 text-center text-xs text-char/70">
                {cart.length === 0 ? "Add at least one plate first." : !ready ? "Fill in your name, phone and address." : "Opens WhatsApp with your order written out."}
              </p>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
