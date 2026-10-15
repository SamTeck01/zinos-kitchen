"use client";

import Image from "next/image";
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
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:px-12">
        <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-bq-red">For parties, families, events</p>
            <h2 className="mt-3 font-display text-3xl uppercase text-char sm:text-5xl">FOOD BY THE LITRE</h2>
            <p className="mt-3 max-w-md text-char/70">Big orders by the litre. Tap a food to ask Zino on WhatsApp.</p>
          </div>
          <div className="relative hidden aspect-[4/5] w-40 overflow-hidden rounded-2xl sm:block">
            <Image src="/zino/packs.webp" alt="Packs of Zino's food" fill sizes="10rem" className="object-cover" />
          </div>
        </div>
      </div>

      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-10 sm:grid-cols-3 sm:gap-4 sm:px-8 lg:grid-cols-4 lg:px-12">
        {LITRES.map((p) => (
          <li key={p.name}>
            <a
              href={ask(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex min-h-24 h-full flex-col justify-between rounded-2xl bg-paper p-4 transition-[transform,background-color] duration-150 hover:bg-white sm:p-5"
            >
              <span className="font-display text-lg uppercase leading-tight text-char sm:text-xl">{p.name}</span>
              {p.sizes?.length ? (
                <span className="mt-3 font-mono text-sm text-bq-red">from {formatPrice(Math.min(...p.sizes.map((s) => s.price)))}</span>
              ) : (
                <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-bq-red">
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
