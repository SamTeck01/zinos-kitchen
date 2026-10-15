"use client";

import { LITRES, formatPrice, WHATSAPP } from "@/data/menu";

/**
 * Food by the litre — separate from Zino's Package and below it.
 * Litre prices aren't confirmed yet, so no price is shown: each card opens
 * WhatsApp asking for that food. When Zino sends prices, add `sizes` to
 * LITRES in data/menu.ts and they render here automatically.
 */
export default function Packages() {
  const ask = (name: string) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi Zino's, how much is ${name} per litre?`)}`;

  return (
    <section id="litres" className="bg-blush">
      <div className="mx-auto max-w-3xl px-5 pt-14 sm:px-8">
        <div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-bq-red">Introducing</p>
            <h2 className="mt-3 font-display text-3xl uppercase text-char sm:text-5xl">SOUP &amp; FOOD BY THE LITRE</h2>
            <p className="mt-3 max-w-md text-char/70">A different thing from the weekend package. Tap a food to ask Zino on WhatsApp.</p>
          </div>
        </div>
      </div>

      <ul className="mx-auto max-w-3xl divide-y divide-char/10 px-5 pb-16 pt-4 sm:px-8">
        {LITRES.map((p) => (
          <li key={p.name}>
            <a
              href={ask(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 items-center justify-between gap-4 py-2 transition-colors duration-150 hover:text-bq-red"
            >
              <span className="font-display text-lg uppercase">{p.name}</span>
              {p.sizes?.length ? (
                <span className="font-mono text-bq-red">from {formatPrice(Math.min(...p.sizes.map((s) => s.price)))}</span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-bq-red">
                  Ask price
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12 12 4M6 4h6v6" /></svg>
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
