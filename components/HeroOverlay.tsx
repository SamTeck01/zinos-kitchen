"use client";
import OrderButton from "./OrderButton";
import HeroVideo from "./HeroVideo";
import CookDay from "./CookDay";
import { useCity } from "../data/cityContext";

/**
 * BQ's hero layout — food centred, small red mono labels diagonally opposed
 * above/below it on mobile and beside it on desktop, order pill under the food,
 * motto and phone number in the side margins on desktop.
 *
 * Zino's food is a looping video, not scroll-scrubbed frames. The video is a
 * rounded square, so the food box is just its width.
 */
export default function HeroOverlay() {
  const { locations } = useCity();
  return (
    <section id="hero" aria-label="Zino's jollof rice" className="relative bg-paper">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col items-center justify-center px-5 py-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-10 lg:px-12">
        {/* left margin on desktop: motto */}
        <h1 className="order-3 mt-6 text-center font-display text-3xl font-extrabold uppercase leading-[0.95] text-char lg:order-1 lg:mt-0 lg:text-left lg:text-5xl">
          Jollof rice
          <br />
          <span className="text-bq-red">with chicken</span>
          <br />
          <span className="text-bq-red">or turkey</span>
        </h1>

        {/* the food */}
        <div className="order-2 w-full max-w-[min(80vw,52vh)] lg:w-[min(36vw,58vh)] lg:max-w-none">
          <p className="mb-2 text-right font-mono text-[0.7rem] uppercase tracking-[0.2em] text-bq-red md:text-xs">Pre-order Thursdays & Fridays</p>
          <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-24px_rgba(165,6,2,0.5)]">
            <HeroVideo />
          </div>
          <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-bq-red md:text-xs">Weekend morning delivery on campus</p>
        </div>

        {/* right margin on desktop: next pot + number */}
        <div className="order-4 mt-4 flex flex-col items-center gap-4 lg:order-3 lg:mt-0 lg:items-end lg:text-right">
          <a href="#order" className="text-center text-sm text-char/70 underline-offset-4 hover:underline lg:text-right">
            Next delivery
            <br />
            <strong className="font-display text-xl font-extrabold uppercase text-char"><CookDay /></strong>
          </a>
          <OrderButton />
          <p className="font-mono text-sm text-char">{locations[0].display}</p>
        </div>
      </div>
    </section>
  );
}
