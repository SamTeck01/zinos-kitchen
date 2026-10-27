"use client";

import { useEffect, useState } from "react";
import { WEEKDAY_SPECIALS, WHATSAPP, formatPrice } from "@/data/menu";

/**
 * Monday–Thursday specials. Sits under the weekend package (still the main
 * offer) and above food by the litre. Today's special is flagged after first
 * paint, so server and client render the same markup.
 */
export default function WeekdaySpecials() {
  const [today, setToday] = useState<number | null>(null);
  // Day must be read on the client after first paint to avoid a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setToday(new Date().getDay()), []);

  const wa = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

  return (
    <section id="weekday" className="bg-paper">
      <div className="mx-auto max-w-3xl px-5 pb-14 sm:px-8 lg:pb-20">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-bq-red">Monday – Thursday</p>
        <h2 className="mt-3 font-display text-3xl uppercase text-char sm:text-4xl">Weekday specials</h2>
        <p className="mb-6 mt-2 text-char/70">A different special every weekday. Tap to order on WhatsApp.</p>

        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {WEEKDAY_SPECIALS.map((s) => {
            const isToday = today === s.day;
            const priced = s.items !== undefined && s.items.length > 0;
            return (
              <li
                key={s.day}
                className={`relative flex flex-col rounded-2xl p-4 sm:p-5 ${priced ? "sm:col-span-2" : ""} ${
                  isToday ? "bg-bq-red text-white" : "bg-blush text-char"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={`font-mono text-xs uppercase tracking-[0.18em] ${isToday ? "text-white/85" : "text-bq-red"}`}>{s.dayName}</span>
                  {isToday && <span className="rounded-full bg-gold px-2.5 py-1 font-display text-[0.65rem] font-extrabold uppercase text-char">Today</span>}
                </span>
                <span className="mt-2 font-display text-xl uppercase leading-tight sm:text-2xl">{s.dish}</span>

                {priced ? (
                  <>
                    <ul className="mt-3 space-y-2">
                      {s.items!.map((it) => (
                        <li key={it.name}>
                          <a
                            href={wa(`Hi Zino's, I'd like ${it.name} for ${s.dayName}.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`press flex min-h-12 items-center justify-between gap-3 rounded-xl px-4 ${isToday ? "bg-white/15 hover:bg-white/25" : "bg-paper hover:bg-white"}`}
                          >
                            <span className="font-medium">{it.name}</span>
                            <span className={`font-mono ${isToday ? "text-gold" : "text-bq-red"}`}>{formatPrice(it.price!)}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    {s.addOn !== undefined && (
                      <p className={`mt-3 text-sm ${isToday ? "text-white/85" : "text-char/70"}`}>
                        Add {s.addOn.name.toLowerCase()}: <span className="font-mono">+{formatPrice(s.addOn.price!)}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <a
                    href={wa(`Hi Zino's, how much is ${s.dish} for ${s.dayName}?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-auto inline-flex min-h-11 items-center gap-1.5 pt-3 font-mono text-xs uppercase tracking-wider ${isToday ? "text-white" : "text-bq-red"}`}
                  >
                    Ask price
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12 12 4M6 4h6v6" /></svg>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
