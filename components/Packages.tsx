"use client";

import { useState } from "react";
import {
  LITRE_IMAGES,
  LITRES,
  formatPrice,
  type MenuItem,
} from "@/data/menu";
import { FoodImage } from "@/lib/slug";
import { useCity } from "../data/cityContext";
import ItemModal from "./ItemModal";
import CookDay from "./CookDay";

/**
 * Food by the litre — BQ's packages section, reused for Zino's bulk food.
 * Each card lists every litre size; tapping opens the item modal to pick one.
 */
export default function Packages() {
  const { locations } = useCity();
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const selectedImage = selected ? LITRE_IMAGES[selected.name] ?? null : null;
  const related = LITRES.filter((p) => p.name !== selected?.name)
    .slice(0, 7)
    .map((item) => ({ item, image: LITRE_IMAGES[item.name] ?? null }));

  return (
    <section id="litres" className="bg-blush">
      <div className="relative aspect-video overflow-hidden">
        <FoodImage
          src="/media/jollof-poster.jpg"
          alt="Jollof rice"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-char/70 to-transparent p-5">
          <h2 className="font-display text-3xl uppercase text-white sm:text-5xl">
            FOOD BY THE LITRE
          </h2>
          <p className="mt-2 text-white/90">
            Order in the week. Cooked on Saturday. Next pot: <strong><CookDay /></strong>
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-12 sm:gap-4 lg:grid-cols-4">
        {LITRES.map((p) => {
          const image = LITRE_IMAGES[p.name] ?? null;

          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setSelected(p)}
              aria-label={`${p.name}${p.desc ? `, ${p.desc}` : ""}, from ${formatPrice(Math.min(...p.sizes!.map((s) => s.price)))}. View sizes.`}
              className={`w-full rounded-2xl border bg-paper p-4 text-left sm:p-6 transition-transform active:scale-[0.98] border-char/10`}
            >
              {image && (
                <span className="relative mb-4 block aspect-[16/9] w-full overflow-hidden rounded-xl bg-blush">
                  <FoodImage src={image} alt={p.name} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover" />
                </span>
              )}
              {/*
                Spans, not <h3>/<p>. A <button> takes phrasing content only, so
                flow elements inside it are invalid HTML — MenuSection.tsx uses
                spans throughout for the same reason. `block` restores the
                layout the heading and paragraph were giving.
              */}
              <span className="block font-display text-xl uppercase">
                {p.name}
              </span>
              {p.desc && (
                <span className="mt-2 inline-block rounded-full border border-char/20 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-char/70">
                  {p.desc}
                </span>
              )}
              <span className="mt-4 block divide-y divide-char/10">
                {p.sizes!.map((s) => (
                  <span key={s.label} className="flex justify-between py-1.5 text-sm">
                    <span className="font-display uppercase">{s.label}</span>
                    <span className="font-mono text-bq-red">{formatPrice(s.price)}</span>
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <ItemModal
        item={selected}
        images={selectedImage ? [selectedImage] : []}
        related={related}
        cityLabel="Ilorin"
        whatsapp={locations[0].whatsapp}
        onClose={() => setSelected(null)}
        onSelectRelated={setSelected}
      />
    </section>
  );
}
