"use client";
import Image from "next/image";
import OrderButton from "./OrderButton";
import CookDay from "./CookDay";
import { useCity } from "../data/cityContext";
import { PACKS, formatPrice } from "../data/menu";

/**
 * BQ's hero layout with Zino's food in a rounded square: food centred and big, small
 * red mono labels diagonally opposed above/below it, order pill, motto, phone.
 * Desktop moves the motto to the left margin and the info to the right.
 */
export default function HeroOverlay() {
  const { locations } = useCity();
  return (
    <section id="hero" aria-label="Zino's jollof rice" className="overflow-x-clip bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-5 pb-12 pt-8 lg:grid lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-12 lg:px-12 lg:py-10">
        {/* the food */}
        <div className="w-full max-w-[22rem] lg:order-2 lg:w-[min(40vw,70vh)] lg:max-w-none">
          <p className="mb-5 text-right font-mono text-[0.7rem] uppercase tracking-[0.2em] text-bq-red">Pre-order Thu &amp; Fri</p>
          <div className="relative">
            <span aria-hidden="true" className="absolute -inset-3 -z-0 rotate-[-4deg] rounded-[2.25rem] bg-blush" />
            <span aria-hidden="true" className="absolute -right-2 -top-3 z-10 rotate-6 rounded-full bg-gold px-3 py-1.5 font-display text-xs font-extrabold uppercase text-char shadow-md">From {formatPrice(PACKS[0].price)}</span>
          <div className="relative aspect-square overflow-hidden rounded-[2rem] shadow-[0_28px_50px_-22px_rgba(165,6,2,0.55)]">
            <Image
              src="/zino/hero.webp"
              alt="Zino's jollof rice with chicken and turkey, plantain and coleslaw"
              fill
              priority
              sizes="(max-width:1024px) 22rem, 40vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
          </div>
          <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-bq-red">Weekend morning delivery</p>
        </div>

        {/* motto */}
        <div className="mt-6 text-center lg:order-1 lg:mt-0 lg:text-left">
          <h1 className="font-display text-[2.1rem] font-extrabold uppercase leading-[0.95] text-char lg:text-5xl">
            Get your
            <br />
            <span className="text-bq-red">tasty jollof rice</span>
          </h1>
          <p className="mt-2 font-display text-sm font-extrabold uppercase tracking-wide text-char/70 lg:text-base">Available every weekend</p>
        </div>

        {/* order */}
        <div className="mt-6 flex flex-col items-center gap-3 lg:order-3 lg:mt-0 lg:items-end lg:text-right">
          <OrderButton />
          <p className="text-sm text-char/70">Next delivery: <strong className="font-medium text-char"><CookDay /></strong></p>
          <p className="font-mono text-sm text-char">{locations[0].display}</p>
        </div>
      </div>
    </section>
  );
}
