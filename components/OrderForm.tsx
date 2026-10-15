"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PACKS, EXTRAS, WHATSAPP, DELIVERY_NOTE, SCHEDULE, formatPrice, type Option } from "../data/menu";

/**
 * Zino's Package builder, as a modal wizard.
 *
 *   Pack (chicken / turkey) → Extras → Your order → Details → WhatsApp
 *
 * Anything on the site opens it with openPlateBuilder().
 */

const OPEN_EVENT = "zk:open-plate";
export const openPlateBuilder = () => window.dispatchEvent(new Event(OPEN_EVENT));

type Pack = { pack: string; extras: Record<string, number>; qty: number };
const byId = (list: Option[], id: string) => list.find((o) => o.id === id)!;
const extrasTotal = (p: Pack) => Object.entries(p.extras).reduce((s, [id, n]) => s + byId(EXTRAS, id).price * n, 0);
const packTotal = (p: Pack) => byId(PACKS, p.pack).price + extrasTotal(p);
const extrasText = (p: Pack) =>
  Object.entries(p.extras).filter(([, n]) => n > 0).map(([id, n]) => `${n > 1 ? `${n}× ` : ""}extra ${byId(EXTRAS, id).name}`);
const describe = (p: Pack) => [byId(PACKS, p.pack).name, ...extrasText(p)].join(" + ");

const FRESH: Pack = { pack: "chicken", extras: {}, qty: 1 };
const STEPS = ["Pack", "Extras", "Your order", "Details"] as const;

const X = () => <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 5 10 10M15 5 5 15" /></svg>;

function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex items-center">
      <button type="button" aria-label={`Remove one ${label}`} onClick={() => onChange(Math.max(0, value - 1))} disabled={!value}
        className="press size-11 rounded-full text-xl disabled:opacity-30">−</button>
      <span className="w-6 text-center font-mono" aria-live="polite">{value}</span>
      <button type="button" aria-label={`Add one ${label}`} onClick={() => onChange(value + 1)}
        className="press size-11 rounded-full bg-bq-red text-xl text-white hover:bg-deep-red">+</button>
    </div>
  );
}

/* ------------------------------------------------------------------ main */
export default function OrderForm() {
  const [cur, setCur] = useState<Pack>(FRESH);
  const [cart, setCart] = useState<Pack[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", mode: "Delivery", address: "", note: "" });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [pulse, setPulse] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const go = (to: number) => { setDir(to >= step ? 1 : -1); setStep(to); bodyRef.current?.scrollTo({ top: 0 }); };
  const show = useCallback((at = 0, pack?: string) => {
    if (pack) setCur({ ...FRESH, pack });
    setStep(at); setDir(1); setOpen(true);
  }, []);
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

  const unit = packTotal(cur);
  const total = useMemo(() => cart.reduce((s, p) => s + packTotal(p) * p.qty, 0), [cart]);
  const count = cart.reduce((n, p) => n + p.qty, 0);
  const setExtra = (id: string, n: number) => setCur((p) => ({ ...p, extras: { ...p.extras, [id]: n } }));
  const addPack = () => { setCart((c) => [...c, cur]); setCur(FRESH); setPulse((n) => n + 1); go(2); };
  const remove = (i: number) => setCart((c) => c.filter((_, j) => j !== i));
  const detailsOk = Boolean(form.name.trim() && form.phone.trim() && (form.mode === "Pickup" || form.address.trim()));

  const send = () => {
    if (!detailsOk || !cart.length) return;
    const msg = [
      `Hi Zino's, I'd like to pre-order:`, "",
      ...cart.map((p) => `• ${p.qty} × ${describe(p)} — ${formatPrice(packTotal(p) * p.qty)}`), "",
      `Total: ${formatPrice(total)}${form.mode === "Delivery" ? " (+ delivery)" : ""}`,
      `Name: ${form.name}`, `Phone: ${form.phone}`,
      form.mode === "Delivery" ? `Delivery to: ${form.address}` : "Pickup",
      form.note && `Note: ${form.note}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  const runAction = () => {
    if (step === 0) go(1);
    else if (step === 1) addPack();
    else if (step === 2) go(3);
    else send();
  };
  const action = [
    { label: "Next: extras", price: unit, disabled: false },
    { label: cur.qty > 1 ? `Add ${cur.qty} packs` : "Add to order", price: unit * cur.qty, disabled: false },
    { label: "Checkout", price: total, disabled: !cart.length },
    { label: "Send on WhatsApp", price: total, disabled: !detailsOk },
  ][step];

  const input = "mt-1 w-full min-h-12 rounded-xl border border-char/15 bg-white px-3 text-base outline-none transition-[border-color] duration-150 focus:border-bq-red";

  return (
    <>
      {/* ---------- the package, on the page: BQ's image cards ---------- */}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4">
        {PACKS.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => show(0, p.id)}
              className="press relative block aspect-[3/4] w-full overflow-hidden rounded-2xl border border-char/10 text-left"
            >
              <Image src={p.img!} alt={p.name} fill sizes="(max-width:640px) 50vw, 24rem" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 border-t border-paper/40 bg-paper/80 p-3 backdrop-blur-sm">
                <span className="block font-display text-sm font-extrabold uppercase leading-tight text-char sm:text-base">{p.name}</span>
                <span className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-sm text-bq-red">{formatPrice(p.price)}</span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-bq-red text-white" aria-hidden="true">
                    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M10 4v12M4 10h12" /></svg>
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <p className="font-display text-lg font-extrabold uppercase">Extras</p>
        <ul className="mt-1 divide-y divide-char/10">
          {EXTRAS.map((e) => (
            <li key={e.id} className="flex items-baseline justify-between py-2.5">
              <span>{e.name}</span><span className="font-mono text-bq-red">{formatPrice(e.price)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 space-y-1.5 rounded-2xl bg-blush p-4 text-sm">
        {SCHEDULE.map((s) => <p key={s}>{s}.</p>)}
        <p className="text-deep-red">{DELIVERY_NOTE}.</p>
      </div>

      <button type="button" onClick={() => show(0)} className="press mt-6 flex min-h-14 w-full items-center justify-center rounded-full bg-bq-red font-display text-lg font-extrabold uppercase text-white hover:bg-deep-red sm:w-auto sm:px-10">
        Build your order
      </button>

      {/* ---------- cart pill ---------- */}
      {count > 0 && !open && (
        <button
          type="button"
          onClick={() => show(2)}
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
                {["Pick your pack", "Add extras", "Your order", "Your details"][step]}
              </h2>

              <div key={step} className={dir > 0 ? "step-in-right" : "step-in-left"}>
                {step === 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {PACKS.map((p) => {
                      const on = cur.pack === p.id;
                      return (
                        <button key={p.id} type="button" aria-pressed={on} onClick={() => setCur({ ...cur, pack: p.id })}
                          className={`press overflow-hidden rounded-2xl border-2 bg-white text-left transition-[border-color] duration-150 ${on ? "border-bq-red" : "border-transparent"}`}>
                          <span className="relative block aspect-[4/5]">
                            <Image src={p.img!} alt="" fill sizes="(max-width:640px) 45vw, 14rem" className="object-cover" />
                            <span className={`absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border-2 transition-colors duration-150 ${on ? "border-bq-red bg-bq-red text-white" : "border-white bg-char/30"}`}>
                              {on && <svg viewBox="0 0 12 12" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6.5 5 9l5-6" /></svg>}
                            </span>
                          </span>
                          <span className="block p-3">
                            <span className="block font-display font-extrabold uppercase leading-tight">{p.name}</span>
                            <span className="font-mono text-sm text-bq-red">{formatPrice(p.price)}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {step === 1 && (
                  <>
                    <p className="mt-1 text-sm text-char/70">Optional. Add as many as you like to this pack.</p>
                    <ul className="mt-3 divide-y divide-char/10 rounded-2xl bg-white px-4">
                      {EXTRAS.map((e) => (
                        <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                          <span>
                            <span className="block font-display text-lg font-extrabold uppercase leading-tight">{e.name}</span>
                            <span className="font-mono text-sm text-bq-red">+{formatPrice(e.price)}</span>
                          </span>
                          <Stepper value={cur.extras[e.id] ?? 0} onChange={(n) => setExtra(e.id, n)} label={e.name} />
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-blush px-4 py-1">
                      <span className="font-display text-lg font-extrabold uppercase">How many packs?</span>
                      <div className="flex items-center">
                        <button type="button" aria-label="One fewer pack" onClick={() => setCur({ ...cur, qty: Math.max(1, cur.qty - 1) })} className="press size-11 rounded-full text-xl">−</button>
                        <span className="w-6 text-center font-mono" aria-live="polite">{cur.qty}</span>
                        <button type="button" aria-label="One more pack" onClick={() => setCur({ ...cur, qty: cur.qty + 1 })} className="press size-11 rounded-full text-xl">+</button>
                      </div>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <div className="mt-4">
                    {cart.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-char/20 p-5 text-char/70">Your order is empty.</p>
                    ) : (
                      <ul className="space-y-2">
                        {cart.map((p, i) => (
                          <li key={i} className="cart-row flex items-center gap-3 rounded-2xl bg-white p-3">
                            <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                              <Image src={byId(PACKS, p.pack).img!} alt="" fill sizes="56px" className="object-cover" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-display font-extrabold uppercase leading-tight">{p.qty} × {byId(PACKS, p.pack).name}</span>
                              {extrasText(p).length > 0 && <span className="text-sm text-char/70">+ {extrasText(p).join(", ")}</span>}
                            </span>
                            <span className="font-mono">{formatPrice(packTotal(p) * p.qty)}</span>
                            <button type="button" aria-label={`Remove ${describe(p)}`} onClick={() => remove(i)} className="press -mr-1 flex size-11 shrink-0 items-center justify-center rounded-full text-char/50 hover:text-bq-red"><X /></button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button type="button" onClick={() => go(0)} className="press mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-dashed border-bq-red/40 font-display text-lg font-extrabold uppercase text-bq-red hover:border-bq-red">
                      + Add another pack
                    </button>
                    <div className="mt-5 flex items-baseline justify-between border-t border-char/15 pt-3">
                      <span className="font-display font-extrabold uppercase">Total</span>
                      <span className="font-mono text-2xl text-bq-red">{formatPrice(total)}</span>
                    </div>
                    <p className="mt-1 text-right text-xs text-char/70">{DELIVERY_NOTE}.</p>
                  </div>
                )}
                {step === 3 && (
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
                    {form.mode === "Delivery" && (
                      <>
                        <label className="block">Where on campus?<input className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Hostel / hall and room" autoComplete="street-address" /></label>
                        <p className="text-xs text-deep-red">{DELIVERY_NOTE}. Morning delivery on weekends.</p>
                      </>
                    )}
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
              {step === 3 && !detailsOk && <p className="mt-2 text-center text-xs text-char/70">Fill in your name, phone{form.mode === "Delivery" ? " and where on campus" : ""}.</p>}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
