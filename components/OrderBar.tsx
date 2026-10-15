"use client";
import { useEffect, useState } from "react";
import OrderButton from "./OrderButton";

/**
 * Floating order button — mobile only.
 *
 * Three deliberate decisions, all from the same complaint:
 *
 * 1. It is a small centred pill, not a full-width bar. This sits over the page
 *    for the whole scroll, so a 64px edge-to-edge red slab reads as an ad
 *    banner, competes with every real CTA, and permanently eats the bottom of
 *    the layout — including the last line of the footer on a short phone.
 *
 * 2. It does not exist while the hero is on screen. The hero already has its own
 *    order pill, so showing this one too is the same button twice, and on a
 *    360x640 phone the fixed pill lands exactly on the hero's phone number. It
 *    fades in once you've scrolled past the hero, which is also the first moment
 *    it's useful.
 *
 * 3. It is the same OrderButton as everywhere else, so the channel sheet, the
 *    Chowdeck gating and the WhatsApp message are defined in exactly one place.
 *
 * IntersectionObserver, not a scroll listener: no work on the main thread while
 * scrolling, and it can't fight ScrollFramesHero's rAF loop.
 */
export default function OrderBar() {
  /**
   * Starts `true` because the hero is on screen on first paint — that's what
   * makes this a subscription rather than a setState-in-effect. The bar is
   * therefore hidden until the observer says the hero has left.
   */
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const past = !heroVisible;

  return (
    <div
      className={[
        "floating-order-bar pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center",
        "pb-[calc(env(safe-area-inset-bottom)+0.85rem)] lg:hidden",
        "transition-all duration-300",
        past ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      ].join(" ")}
      aria-hidden={!past}
    >
      <OrderButton
        label="ORDER"
        variant="bar"
        className={`shadow-[0_12px_30px_-10px_rgba(20,16,14,0.55)] ${past ? "pointer-events-auto" : ""}`}
      />
    </div>
  );
}
