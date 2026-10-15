"use client";
import Image from "next/image";
import OrderButton from "./OrderButton";
import CookDay from "./CookDay";

/**
 * Mobile first: headline, photo and the order button all sit inside the first
 * screen of a 390x844 phone. Desktop puts text left, photo right.
 */
export default function HeroOverlay() {
  return (
    <section id="hero" aria-label="Zino's jollof rice" className="bg-paper">
      <div className="mx-auto grid max-w-6xl gap-5 px-5 pb-10 pt-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:py-16">
        <div className="lg:order-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_24px_48px_-24px_rgba(165,6,2,0.55)] lg:aspect-[4/5]">
            <Image
              src="/zino/hero.webp"
              alt="Zino's jollof rice with chicken and turkey, plantain and coleslaw"
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </div>

        <div className="lg:order-1">
          <h1 className="font-display text-[2.6rem] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-char sm:text-6xl lg:text-7xl">
            Get your <span className="text-bq-red">tasty jollof rice</span>
          </h1>
          <p className="mt-2 font-display text-lg font-extrabold uppercase text-char/80 sm:text-xl">Available every weekend</p>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-blush px-4 py-3 lg:max-w-md">
            <span className="leading-tight">
              <span className="block text-xs text-char/70">Next delivery</span>
              <span className="block font-display font-extrabold uppercase"><CookDay /></span>
            </span>
            <OrderButton className="shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
