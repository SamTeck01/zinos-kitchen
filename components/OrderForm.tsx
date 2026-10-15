"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PLATES, PROTEINS, SIDES, WHATSAPP, formatPrice, type Option } from "../data/menu";

/**
 * Build-your-plate, as a modal wizard.
 *
 *   Size → Protein → Sides → Your order → Details → WhatsApp
 *
 * Anything on the site can open it with openPlateBuilder(). The 3D plate at the
 * top is a stack of Blender renders from one camera, so layers line up exactly.
 */

const OPEN_EVENT = "zk:open-plate";
export const openPlateBuilder = () => window.dispatchEvent(new Event(OPEN_EVENT));

type Plate = { size: string; protein: string; sides: string[]; qty: number };
const byId = (list: Option[], id: string) => list.find((o) => o.id === id)!;
const plateTotal = (p: Plate) =>
  byId(PLATES, p.size).price + byId(PROTEINS, p.protein).price + p.sides.reduce((s, id) => s + byId(SIDES, id).price, 0);
const describe = (p: Plate) =>
  [`${byId(PLATES, p.size).name} Jollof Rice`, p.protein !== "none" && byId(PROTEINS, p.protein).name, ...p.sides.map((id) => byId(SIDES, id).name)]
    .filter(Boolean).join(" + ");

const FRESH: Plate = { size: "Big Plate", protein: "chicken", sides: ["plantain"], qty: 1 };
const STEPS = ["Size", "Protein", "Sides", "Your order", "Details"] as const;

/* ------------------------------------------------------------------ plate */
function PlateStage({ plate }: { plate: Plate }) {
  const extras = [plate.protein, ...plate.sides].filter((id) => id !== "none");
  const sizes = "(max-width:640px) 80vw, 22rem";
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-[min(72vw,19rem)]">
      <Image src="/3d/plate.webp" alt="" fill sizes={sizes} className="object-contain" priority />
      {PLATES.map((r) => (
        <Image key={r.id} src={r.id === "Big Plate" ? "/3d/rice-big.webp" : "/3d/rice-small.webp"} alt="" fill sizes={sizes}
          className={`plate-layer object-contain ${plate.size === r.id ? "is-on" : ""}`} />
      ))}
      {[...PROTEINS, ...SIDES].filter((o) => o.id !== "none").map((o) => (
        <Image key={o.id} src={`/3d/${o.id}.webp`} alt="" fill sizes={sizes}
          className={`plate-layer plate-drop object-contain ${extras.includes(o.id) ? "is-on" : ""}`} />
      ))}
    </div>
  );
}

function Choice({ active, onClick, title, price, img, multi }: { active: boolean; onClick: () => void; title: string; price?: string; img?: string; multi?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-[background-color,border-color] duration-150 ${
        active ? "border-bq-red bg-white" : "border-transparent bg-white/60 hover:border-char/15"
      }`}
    >
      {img && <Image src={img} alt="" width={44} height={44} className="size-11 shrink-0 rounded-full object-cover" />}
      <span className="flex-1">
        <span className="block font-display text-lg font-extrabold uppercase leading-tight">{title}</span>
        {price && <span className="font-mono text-sm text-bq-red">{price}</span>}
      </span>
      <span
        className={`flex size-6 shrink-0 items-center justify-center border-2 transition-colors duration-150 ${multi ? "rounded-md" : "rounded-full"} ${
          active ? "border-bq-red bg-bq-red text-white" : "border-char/25"
        }`}
      >
        {active && <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6.5 5 9l5-6" /></svg>}
      </span>
    </button>
  );
}

const X = () => <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 5 10 10M15 5 5 15" /></svg>;

/* ------------------------------------------------------------------ main */
export default function OrderForm() {
  const [plate, setPlate] = useState<Plate>(FRESH);
  const [cart, setCart] = useState<Plate[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", mode: "Delivery", address: "", note: "" });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [pulse, setPulse] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const go = (to: number) => { setDir(to >= step ? 1 : -1); setStep(to); bodyRef.current?.scrollTo({ top: 0 }); };
  const show = useCallback((at = 0) => { setStep(at); setDir(1); setOpen(true); }, []);
  const close = () => { setClosing(true); window.setTimeout(() => { setOpen(false); setClosing(false); }, 200); };

  useEffect(() => {
    const onOpen = () => show(0);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const unit = plateTotal(plate);
  const total = useMemo(() => cart.reduce((s, p) => s + plateTotal(p) * p.qty, 0), [cart]);
  const count = cart.reduce((n, p) => n + p.qty, 0);
  const toggleSide = (id: string) =>
    setPlate((p) => ({ ...p, sides: p.sides.includes(id) ? p.sides.filter((s) => s !== id) : [...p.sides, id] }));
  const addPlate = () => { setCart((c) => [...c, plate]); setPlate(FRESH); setPulse((n) => n + 1); go(3); };
  const remove = (i: number) => setCart((c) => c.filter((_, j) => j !== i));
  const detailsOk = Boolean(form.name.trim() && form.phone.trim() && (form.mode === "Pickup" || form.address.trim()));

  const send = () => {
    if (!detailsOk || !cart.length) return;
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

  const input = "mt-1 w-full min-h-12 rounded-xl border border-char/15 bg-white px-3 text-base outline-none transition-[border-color] duration-150 focus:border-bq-red";
  const building = step <= 2;

  const runAction = () => {
    if (step === 0) go(1);
    else if (step === 1) go(2);
    else if (step === 2) addPlate();
    else if (step === 3) go(4);
    else send();
  };
  const action = [
    { label: "Next: protein", price: unit, disabled: false },
    { label: "Next: sides", price: unit, disabled: false },
    { label: plate.qty > 1 ? `Add ${plate.qty} plates` : "Add to order", price: unit * plate.qty, disabled: false },
    { label: "Checkout", price: total, disabled: !cart.length },
    { label: "Send on WhatsApp", price: total, disabled: !detailsOk },
  ][step];

  return (
    <>
      {/* ---------- teaser on the page ---------- */}
      <div className="grid items-center gap-8 sm:grid-cols-2">
        <button type="button" onClick={() => show(0)} className="press" aria-label="Build your plate">
          <PlateStage plate={plate} />
        </button>
        <div>
          <ol className="space-y-3">
            {["Pick a small or big plate", "Add chicken, fish or beef", "Add plantain or coleslaw", "Send it to Zino on WhatsApp"].map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blush font-mono text-sm text-bq-red">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => show(0)} className="press mt-7 inline-flex min-h-14 items-center gap-3 rounded-full bg-bq-red px-8 font-display text-lg font-extrabold uppercase text-white duration-150 hover:bg-deep-red">
            Build your plate
            <span className="font-mono text-sm font-normal opacity-80">from {formatPrice(PLATES[0].price)}</span>
          </button>
        </div>
      </div>

      {/* ---------- cart pill ---------- */}
      {count > 0 && !open && (
        <button
          type="button"
          onClick={() => show(3)}
          className="cart-pill press fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.85rem)] z-[55] mx-auto flex min-h-14 max-w-md items-center justify-between rounded-full bg-char px-6 text-white shadow-[0_16px_36px_-12px_rgba(20,16,14,0.6)] hover:bg-deep-red"
        >
          <span className="flex items-center gap-3">
            <span key={pulse} className="cart-bump flex size-8 items-center justify-center rounded-full bg-bq-red font-mono text-sm">{count}</span>
            <span className="font-display text-lg font-extrabold uppercase">View order</span>
          </span>
          <span className="font-mono">{formatPrice(total)}</span>
        </button>
      )}

      {/* ---------- the modal ---------- */}
      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" data-state={closing ? "closing" : "open"}>
          <button type="button" aria-label="Close" tabIndex={-1} onClick={close} className="sheet-backdrop absolute inset-0 bg-char/55 backdrop-blur-[2px]" />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pb-title"
            tabIndex={-1}
            className="sheet relative flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-paper outline-none sm:max-h-[90vh] sm:max-w-lg sm:rounded-[2rem]"
          >
            <div className="flex items-center gap-2 px-3 pt-3">
              <button type="button" onClick={() => go(Math.max(0, step - 1))} aria-label="Back" disabled={step === 0}
                className="press flex size-11 items-center justify-center rounded-full disabled:invisible">
                <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.5 4 6.5 10l6 6" /></svg>
              </button>
              <div className="flex flex-1 gap-1.5" aria-hidden="true">
                {STEPS.map((s, i) => (
                  <span key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-char/10">
                    <span className="block h-full origin-left rounded-full bg-bq-red transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ transform: `scaleX(${i <= step ? 1 : 0})` }} />
                  </span>
                ))}
              </div>
              <button type="button" onClick={close} aria-label="Close" className="press flex size-11 items-center justify-center rounded-full"><X /></button>
            </div>

            <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 pb-4 sm:px-7">
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-bq-red">Step {step + 1} of {STEPS.length}</p>
              <h2 id="pb-title" className="font-display text-3xl font-extrabold uppercase leading-none">
                {["Pick your plate", "Add protein", "Add sides", "Your order", "Your details"][step]}
              </h2>

              {building && (
                <div className="relative mt-2">
                  <PlateStage plate={plate} />
                  <span key={unit} className="price-tick absolute bottom-3 right-0 rounded-full bg-char px-4 py-2 font-mono text-sm text-white shadow-lg">{formatPrice(unit)}</span>
                </div>
              )}

              <div key={step} className={dir > 0 ? "step-in-right" : "step-in-left"}>
                {step === 0 && (
                  <div className="mt-3 grid gap-2">
                    {PLATES.map((r) => (
                      <Choice key={r.id} active={plate.size === r.id} onClick={() => setPlate({ ...plate, size: r.id })} title={`${r.name} Jollof`} price={formatPrice(r.price)} />
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div className="mt-3 grid gap-2">
                    {PROTEINS.map((p) => (
                      <Choice key={p.id} active={plate.protein === p.id} onClick={() => setPlate({ ...plate, protein: p.id })} title={p.name} img={p.img} price={p.price ? `+${formatPrice(p.price)}` : undefined} />
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <>
                    <div className="mt-3 grid gap-2">
                      {SIDES.map((s) => (
                        <Choice key={s.id} multi active={plate.sides.includes(s.id)} onClick={() => toggleSide(s.id)} title={s.name} img={s.img} price={`+${formatPrice(s.price)}`} />
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/60 px-4 py-1">
                      <span className="font-display text-lg font-extrabold uppercase">How many plates?</span>
                      <div className="flex items-center">
                        <button type="button" aria-label="One fewer" onClick={() => setPlate({ ...plate, qty: Math.max(1, plate.qty - 1) })} className="press size-11 rounded-full text-xl">−</button>
                        <span className="w-6 text-center font-mono" aria-live="polite">{plate.qty}</span>
                        <button type="button" aria-label="One more" onClick={() => setPlate({ ...plate, qty: plate.qty + 1 })} className="press size-11 rounded-full text-xl">+</button>
                      </div>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <div className="mt-4">
                    {cart.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-char/20 p-5 text-char/70">Your order is empty.</p>
                    ) : (
                      <ul className="space-y-2">
                        {cart.map((p, i) => (
                          <li key={i} className="cart-row flex items-start justify-between gap-3 rounded-2xl bg-white p-4">
                            <span>
                              <span className="block font-display font-extrabold uppercase leading-tight">{p.qty} × {byId(PLATES, p.size).name}</span>
                              <span className="text-sm text-char/70">{describe(p)}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1">
                              <span className="font-mono">{formatPrice(plateTotal(p) * p.qty)}</span>
                              <button type="button" aria-label={`Remove ${describe(p)}`} onClick={() => remove(i)} className="press -my-2 -mr-2 flex size-11 items-center justify-center rounded-full text-char/50 hover:text-bq-red"><X /></button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button type="button" onClick={() => go(0)} className="press mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-bq-red/40 font-display text-lg font-extrabold uppercase text-bq-red hover:border-bq-red">
                      + Add another plate
                    </button>
                    <div className="mt-5 flex items-baseline justify-between border-t border-char/15 pt-3">
                      <span className="font-display font-extrabold uppercase">Total</span>
                      <span className="font-mono text-2xl text-bq-red">{formatPrice(total)}</span>
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="mt-4 space-y-3 text-sm">
                    <label className="block">Name<input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label>
                    <label className="block">Phone<input className={input} type="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" /></label>
                    <fieldset className="grid grid-cols-2 gap-2">
                      <legend className="mb-1">Delivery or pickup</legend>
                      {["Delivery", "Pickup"].map((m) => (
                        <label key={m} className={`press flex min-h-12 cursor-pointer items-center justify-center rounded-xl border font-medium transition-[background-color,color] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bq-red ${form.mode === m ? "border-char bg-char text-white" : "border-char/15 bg-white"}`}>
                          <input type="radio" name="mode" value={m} checked={form.mode === m} onChange={() => setForm({ ...form, mode: m })} className="sr-only" />{m}
                        </label>
                      ))}
                    </fieldset>
                    {form.mode === "Delivery" && <label className="block">Delivery address<input className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autoComplete="street-address" /></label>}
                    <label className="block">Note (optional)<input className={input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
                    <p className="pt-1 text-xs text-char/70">WhatsApp opens with your order written out. Just press send.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-char/10 bg-paper px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 sm:px-7 sm:pb-5">
              <button
                type="button"
                onClick={runAction}
                disabled={action.disabled}
                className="press flex min-h-14 w-full items-center justify-between rounded-full bg-bq-red px-6 font-display text-lg font-extrabold uppercase text-white transition-[background-color,opacity] duration-150 hover:bg-deep-red disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>{action.label}</span>
                <span key={action.price} className="price-tick font-mono text-base font-normal">{formatPrice(action.price)}</span>
              </button>
              {step === 4 && !detailsOk && <p className="mt-2 text-center text-xs text-char/70">Fill in your name, phone{form.mode === "Delivery" ? " and address" : ""}.</p>}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
