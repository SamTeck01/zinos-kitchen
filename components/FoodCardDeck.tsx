"use client";

/**
 * FoodCardDeck
 * ------------
 * Rectangular food cards on a horizontal track. Each card sits turned on its
 * Y axis rather than flat to the screen, and turns further as it moves across
 * the viewport when you swipe.
 *
 * v2: the card is now a single 4:5 photograph with the name and price laid over
 * the bottom of it, so the card is almost entirely food. Tapping anywhere on it
 * opens the detail modal.
 *
 * v3: `image` may be null. About a third of the menu has no photograph and never
 * will — the packages deliberately don't, and several items can't share an
 * archetype photo without contradicting their own confirmed description. Those
 * cards render as centred typography over the empty-table tile instead. This is
 * a designed state, not a fallback: do not "fix" it by pointing every card at a
 * photo.
 *
 * v4: the deck now says it's a deck. Cards are 70vw so the next one always peeks
 * in, there's a position indicator under the track, and a "swipe" hint sits
 * beside it until the first swipe. On a phone there is no scrollbar and a
 * screen-filling card looks like a static image, so without these three the
 * carousel is invisible as an interaction. Do not remove them to "clean it up".
 *
 * WHY IT'S BUILT THIS WAY (don't "improve" this into a custom gesture engine):
 * the track is a native `overflow-x-auto` scroller with scroll-snap. That means
 * iOS and Android momentum, rubber-banding and fling physics come free from the
 * OS and are perfectly smooth. We only *read* scroll position and write
 * transforms. A hand-rolled pointer-drag implementation is far more code and
 * always feels worse on a real phone. It also means a swipe that scrolls does
 * not fire a click, so the whole-card button below is safe.
 *
 * WHY A GRADIENT AND NOT backdrop-blur ON THE TEXT PANEL:
 * `backdrop-filter` nested inside an element that already carries a 3D
 * transform is unreliable in Safari — it samples the wrong backdrop or renders
 * nothing. Every card here is 3D-transformed by definition, so blur is the one
 * effect that cannot go in this component. The gradient achieves the same thing
 * (food still visible through the text area), costs nothing, and cannot break.
 * The flat cards in the menu grid are a different case — blur is fine there.
 *
 * Performance rules being followed here:
 *  - transforms written directly to DOM nodes via refs, never through React
 *    state, so swiping causes zero re-renders
 *  - one rAF-throttled scroll listener for the whole deck
 *  - only `transform` and `opacity` are animated (compositor-only, no layout)
 *  - prefers-reduced-motion → cards sit flat, scroll still works
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const PLACEHOLDER = "/images/placeholder.jpg";

export type FoodCard = {
  id: string;
  name: string;
  /** Pre-formatted, e.g. "N8,500" or "from N4,500". */
  price: string;
  /**
   * null when no photograph exists for this item — not every dish has one, and
   * never will. See the typographic branch below.
   */
  image: string | null;
  /** Small line above the name on typographic cards, e.g. "ILORIN · CHICKEN". */
  meta?: string;
};

/** Degrees of turn at the edge of the viewport. Higher = more dramatic. */
const MAX_TURN = 34;
/** Resting turn on the centred card, so a settled card is never flat-on. */
const BASE_SLANT = -7;
/** How much the off-centre cards shrink. Keep subtle. */
const SCALE_FALLOFF = 0.14;
/** Push turned cards back in Z so the turn reads as depth, not skew. */
const MAX_DEPTH = 60;

/**
 * `src === null` is the ordinary case for an item with no photograph, and
 * `failed` is the rare case of a file that 404s or decodes badly. Both land on
 * the same asset: placeholder.jpg is not a grey box, it's the same warm table
 * the real photos were shot on, empty. So a missing photo looks like a plate
 * that hasn't arrived rather than an image that broke.
 *
 * alt is empty when there's no photo — the name and price are already real text
 * in the typographic branch, and a screen reader announcing "empty table" twice
 * per card is noise, not information.
 */
function CardImage({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const missing = src === null;
  return (
    <Image
      src={missing || failed ? PLACEHOLDER : src}
      alt={missing ? "" : alt}
      fill
      sizes="(max-width: 640px) 70vw, 22rem"
      onError={() => setFailed(true)}
      className="object-cover"
    />
  );
}

export default function FoodCardDeck({
  cards,
  onSelect,
}: {
  cards: FoodCard[];
  /** Opens the detail modal for this card's item. */
  onSelect?: (id: string) => void;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const thumbRef = useRef<HTMLSpanElement>(null);

  /**
   * On a phone a horizontal scroller is invisible as an affordance — there is no
   * scrollbar, and a card that fills the screen looks like a static image. Three
   * things fix that, in order of how much they help: the next card visibly peeks
   * in from the right, a position indicator sits under the track, and a "swipe"
   * hint shows until the first swipe. The hint is the only piece that uses React
   * state, and it flips exactly once.
   */
  const [hinted, setHinted] = useState(false);
  const hintedRef = useRef(false);

  const paint = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // Position indicator. transform only, written straight to the node, so the
    // whole deck still causes zero re-renders while swiping.
    const thumb = thumbRef.current;
    if (thumb) {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;
      thumb.style.transform = `translateX(${(p * 68).toFixed(1)}px)`;
      if (track.scrollLeft > 8 && !hintedRef.current) {
        hintedRef.current = true;
        setHinted(true);
      }
    }
    if (reducedRef.current) return;

    const trackRect = track.getBoundingClientRect();
    const trackCentre = trackRect.left + trackRect.width / 2;
    // Half the viewport is the distance at which a card reaches MAX_TURN.
    const reach = trackRect.width / 2 || 1;

    for (const el of itemsRef.current) {
      if (!el) continue;

      const r = el.getBoundingClientRect();
      // Skip cards well outside the viewport — nothing to paint.
      if (r.right < trackRect.left - 200 || r.left > trackRect.right + 200) {
        continue;
      }

      const cardCentre = r.left + r.width / 2;
      // -1 (fully left) … 0 (centred) … +1 (fully right)
      const t = Math.max(-1.4, Math.min(1.4, (cardCentre - trackCentre) / reach));
      const mag = Math.abs(t);

      const turn = BASE_SLANT + -t * MAX_TURN;
      const scale = 1 - mag * SCALE_FALLOFF;
      const depth = -mag * MAX_DEPTH;

      el.style.transform =
        `perspective(1100px) translateZ(${depth.toFixed(1)}px) ` +
        `rotateY(${turn.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = String(1 - mag * 0.35);
      // Cards nearer the centre stack above their neighbours.
      el.style.zIndex = String(100 - Math.round(mag * 100));
    }
  }, []);

  /**
   * Reduced motion: cards sit flat and upright at full opacity, and the deck
   * still scrolls and snaps.
   *
   * The disable is deliberate. react-hooks/immutability objects to writing
   * through a ref here, but writing transforms straight to DOM nodes via refs is
   * the entire point of this component — see the performance note at the top.
   * paint() does exactly the same thing on every frame. The alternative is
   * driving it from React state, which is the thing we're avoiding.
   */
  const flatten = useCallback(() => {
    for (const el of itemsRef.current) {
      if (!el) continue;
      // eslint-disable-next-line react-hooks/immutability
      el.style.transform = "none";
      el.style.opacity = "1";
    }
  }, []);

  const onScroll = useCallback(() => {
    // Not gated on reduced-motion: the position indicator still needs to track,
    // it just isn't motion in the vestibular sense. paint() returns before the
    // card transforms when reduced-motion is set.
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paint();
    });
  }, [paint]);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const track = trackRef.current;
    if (!track) return;

    if (reducedRef.current) {
      flatten();
    }

    paint();
    track.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(onScroll);
    ro.observe(track);

    return () => {
      track.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll, paint, flatten]);

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        aria-label="Swipe sideways for more items"
        className={[
          "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain",
          // Half-viewport padding so the first and last card can reach the
          // centre. Cards are 70vw, not full width, so ~11vw of the NEXT card is
          // always visible — that peek is the single strongest signal on a phone
          // that there is more to the right.
          "px-[calc(50vw-35vw)] pb-6 pt-10 sm:px-[calc(50%-11rem)]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "[transform-style:preserve-3d]",
        ].join(" ")}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {cards.map((card, i) => (
          <li
            key={card.id}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            className={[
              "relative shrink-0 snap-center",
              "w-[70vw] max-w-[22rem]",
              "will-change-transform",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => onSelect?.(card.id)}
              aria-label={`${card.name}, ${card.price}. View details.`}
              className={[
                "relative block aspect-[4/5] w-full overflow-hidden",
                "rounded-2xl border border-char/10 bg-blush text-left",
                "shadow-[0_18px_40px_-24px_rgba(20,16,14,0.45)]",
                "transition-transform active:scale-[0.98]",
              ].join(" ")}
            >
              <CardImage src={card.image} alt={card.name} />

              {card.image === null ? (
                /*
                  NO PHOTOGRAPH. Not a failure state — roughly a third of the menu
                  will never have one, and packages deliberately never will.
                  Bottom-anchored text needs a photo above it to anchor against;
                  with nothing there it reads as an unfinished card. So this branch
                  centres the type instead and lets the empty table tile act as
                  paper. It becomes a menu-board card rather than a missing image.
                */
                <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  {card.meta && (
                    <span className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-char/50">
                      {card.meta}
                    </span>
                  )}
                  <span className="block font-display text-xl font-bold uppercase leading-tight tracking-tight text-char">
                    {card.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className="my-3 block h-px w-10 bg-bq-red/30"
                  />
                  <span className="block font-mono text-lg text-bq-red">
                    {card.price}
                  </span>
                </span>
              ) : (
                /*
                  Gradient, not backdrop-blur — see the note at the top of this file.
                  The food stays visible through the upper part of the panel while
                  the text sits on the opaque base.
                */
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper via-paper/90 to-transparent px-4 pb-4 pt-10">
                  <span className="block font-display text-lg font-bold uppercase leading-tight tracking-tight text-char">
                    {card.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-base text-bq-red">
                    {card.price}
                  </span>
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/*
        Affordance row. The indicator tells you where you are in the set; the
        word tells you what to do and leaves as soon as you've done it. Both are
        aria-hidden — the <ul> already carries the instruction as its label, and
        a screen reader user is not swiping.
      */}
      <div
        aria-hidden="true"
        className="mt-1 flex items-center justify-center gap-3"
      >
        <span className="relative block h-px w-24 overflow-hidden bg-char/15">
          <span
            ref={thumbRef}
            className="absolute left-0 top-0 block h-full w-7 bg-bq-red"
          />
        </span>
        <span
          className={[
            "font-mono text-[0.65rem] uppercase tracking-[0.25em] text-char/50",
            "transition-opacity duration-500 sm:hidden",
            hinted ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          Swipe →
        </span>
      </div>
    </div>
  );
}

