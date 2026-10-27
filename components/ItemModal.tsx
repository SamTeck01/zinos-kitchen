/**
 * ItemModal
 * ---------
 * Tap a menu item → full detail. Hand-written rather than prompted because the
 * things that make a modal feel cheap are all invisible in a screenshot:
 * body-scroll lock, focus trap, Escape, restoring focus to the element that
 * opened it, and not animating anything expensive.
 *
 * v2 changes:
 *  - `images` is an array. One image renders a single frame; two or more render
 *    a swipeable carousel with dots. The carousel capability ships empty on
 *    purpose — see the note below.
 *  - image loading failure falls back to the placeholder internally, so this
 *    file no longer needs FoodImage passed in from outside.
 *  - a "more from this category" row, built from real menu data, so the modal
 *    has somewhere to go instead of dead-ending.
 *
 * v3: `images` may be empty and `related[].image` may be null, because most of
 * the menu has no photograph and never will. Both resolve to the empty-table
 * tile, and the image well collapses from 4:3 to a 16:9 band when there's no
 * photo so it reads as a header rather than a broken well. These are designed
 * states — do not "fix" them by routing everything through a placeholder path,
 * which would hide the distinction from the components that need it.
 *
 * v4: MenuItem may carry `includes`, used by packages. descPending items say
 * the rest is confirmed on order rather than padding the space with invented
 * contents. The empty 16:9 image band is the designed package state until real
 * photography arrives.
 *
 * ON THE CAROUSEL, DELIBERATELY LEFT UNUSED FOR NOW: while the menu photography
 * is AI-generated, pass exactly ONE image per item. Generated variants of the
 * same dish never match each other — different bun, different filling count —
 * and a carousel places those mismatches two seconds apart where they're
 * impossible to miss. A single image hides the inconsistency. When BQ supply
 * real photography, pass three angles and this lights up with no code change.
 */

"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import type { MenuItem } from "@/data/menu";
import { formatPrice } from "@/data/menu";
import { useCity } from "../data/cityContext";

const PLACEHOLDER = "/images/placeholder.jpg";

/**
 * BQ already write their descriptions as contents — "Grilled beef chunks,
 * veggies, 2 hotdogs, shawarma bread with sauce". Rendered as a paragraph that
 * reads as filler; rendered as a list it reads as detail. Same data either way,
 * which is the point: this adds substance without inventing a word.
 */
function parseContents(desc: string): string[] {
  const parts = desc
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Their last item is usually joined with "and" — "grilled chicken and cheese
  // sauce". Split that into two entries, but never when brackets are involved:
  // "egg (fried and boiled)" has to stay in one piece.
  const last = parts[parts.length - 1];
  if (last && !last.includes("(") && / and /.test(last)) {
    const halves = last.split(/ and /).map((h) => h.trim());
    if (halves.every((h) => h.length > 2)) {
      parts.splice(parts.length - 1, 1, ...halves);
    }
  }

  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1));
}

export type ItemModalProps = {
  item: MenuItem | null;
  /**
   * Empty when no photograph exists for this item — a normal state, not an
   * error. One entry while photography is AI-generated. Three-plus once it's
   * real, at which point the carousel below lights up with no code change.
   */
  images: string[];
  /**
   * Other items from the same category, for the "more from" row. `image` is null
   * for items with no photograph, which is most of some categories.
   */
  related?: { item: MenuItem; image: string | null }[];
  cityLabel: string;
  /** What the order is for, e.g. "Wednesday Special". */
  when?: string;
  whatsapp: string;
  onClose: () => void;
  /** Swap the modal's contents to a related item without closing. */
  onSelectRelated?: (item: MenuItem) => void;
};

/* -------------------------------------------------------------------------- */

/**
 * `src === null` means no photograph exists — ordinary. `failed` means a file
 * broke — rare. Both resolve to placeholder.jpg, which is not a grey box but the
 * same warm table the real food was shot on, empty. alt is dropped when there's
 * no photo: the name is already real text beside it, and announcing "empty
 * table" per thumbnail is noise.
 */
function SafeImage({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const missing = src === null;
  return (
    <Image
      src={missing || failed ? PLACEHOLDER : src}
      alt={missing ? "" : alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className="object-cover"
    />
  );
}

/* -------------------------------------------------------------------------- */

export default function ItemModal({
  item,
  images,
  related = [],
  cityLabel,
  when,
  whatsapp,
  onClose,
  onSelectRelated,
}: ItemModalProps) {
  const { city } = useCity();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const [sizeIndex, setSizeIndex] = useState(0);
  const [slide, setSlide] = useState(0);

  const open = item !== null;
  const hasPhoto = images.length > 0;
  const shots = hasPhoto ? images : [PLACEHOLDER];
  const multi = shots.length > 1;

  // Reset per-item state when a different item is opened, otherwise the
  // previous item's size and slide leak into the next one.
  useEffect(() => {
    // Reset modal-local choices when a different menu item is selected.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSizeIndex(0);
    setSlide(0);
    railRef.current?.scrollTo({ left: 0 });
  }, [item?.name]);

  /* ---------------------------------------------- scroll lock + focus + esc */
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement;

    // Lock the page behind the modal without the layout jumping as the
    // scrollbar disappears on desktop.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  /* ------------------------------------------------- carousel dot tracking */
  const onRailScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const i = Math.round(rail.scrollLeft / rail.clientWidth);
    setSlide((prev) => (prev === i ? prev : i));
  }, []);

  const onBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!item) return null;

  /* ------------------------------------------------------------ price logic */
  const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
  const chosen = hasSizes ? item.sizes![sizeIndex] : undefined;
  const activePrice = hasSizes ? chosen?.price : item.price;
  const priceLabel =
    activePrice === undefined ? undefined : formatPrice(activePrice);

  // Include the size so the order isn't ambiguous on the other end.
  const orderName =
    hasSizes && chosen ? `${item.name} (${chosen.label})` : item.name;
  const message =
    `Hi Zino's, I'd like to order the ${orderName}` +
    (priceLabel ? ` — ${priceLabel}` : "") +
    (when ? ` (${when}).` : ".");
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  const includes = item.includes ?? [];
  const hasIncludes = includes.length > 0;
  const showDesc = Boolean(item.desc) && !item.descPending;

  return (
    <div
      onClick={onBackdrop}
      className="fixed inset-0 z-50 flex items-end justify-center bg-char/60 backdrop-blur-sm sm:items-center sm:p-6"
      style={{ animation: "bqFade 160ms ease-out" }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-paper [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-md sm:rounded-3xl"
        style={{ animation: "bqRise 220ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-paper/90 text-char shadow-md backdrop-blur transition-transform active:scale-90"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            &times;
          </span>
        </button>

        {/* ----------------------------------------------------- image(s) */}
        <div className="relative">
          <div
            ref={railRef}
            onScroll={multi ? onRailScroll : undefined}
            className={[
              "flex w-full",
              multi
                ? "snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : "overflow-hidden",
            ].join(" ")}
            style={multi ? { WebkitOverflowScrolling: "touch" } : undefined}
          >
            {shots.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={[
                  "relative w-full shrink-0 snap-center bg-blush",
                  // A full 4:3 well of empty peach reads as a photograph that
                  // failed to load. Collapsing it to a 16:9 band makes the same
                  // tile read as a header instead, and lifts the name, contents
                  // and price higher up the sheet — which is what someone opened
                  // this for when there's no photo to look at.
                  hasPhoto ? "aspect-[4/3]" : "aspect-[16/9]",
                ].join(" ")}
              >
                <SafeImage
                  src={src}
                  alt={
                    multi
                      ? `${item.name}, view ${i + 1} of ${shots.length}`
                      : item.name
                  }
                  sizes="(max-width: 640px) 100vw, 28rem"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          {multi && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {shots.map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={[
                    "h-1.5 rounded-full transition-all duration-200",
                    i === slide ? "w-5 bg-paper" : "w-1.5 bg-paper/55",
                  ].join(" ")}
                />
              ))}
            </div>
          )}
        </div>

        {/* --------------------------------------------------------- detail */}
        <div className="p-5 pb-7">
          <h2
            id={titleId}
            className="font-display text-2xl font-bold uppercase leading-tight text-bq-red"
          >
            {item.name}
          </h2>

          {hasIncludes && (
            <div className="mt-4">
              <p className="font-mono text-xs uppercase tracking-widest text-char/60">
                What&rsquo;s inside
              </p>
              <ul className="mt-2 space-y-1.5">
                {includes.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-sm leading-snug text-char/80"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-bq-red"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.descPending && (
            <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-wider text-char/50">
              Full contents confirmed when you order.
            </p>
          )}

          {showDesc && (
            <div className="mt-4">
              <p className="font-mono text-xs uppercase tracking-widest text-char/60">
                What&rsquo;s inside
              </p>
              <ul className="mt-2 space-y-1.5">
                {parseContents(item.desc!).map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-sm leading-snug text-char/80"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-bq-red"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasSizes && (
            <fieldset className="mt-5">
              <legend className="font-mono text-xs uppercase tracking-widest text-char/60">
                Choose a size
              </legend>
              <div className="mt-2 flex gap-2">
                {item.sizes!.map((s, i) => {
                  const active = i === sizeIndex;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSizeIndex(i)}
                      aria-pressed={active}
                      className={[
                        "min-h-11 flex-1 rounded-xl border px-3 py-1.5 text-left transition-colors",
                        active
                          ? "border-bq-red bg-bq-red/10"
                          : "border-char/20 bg-transparent",
                      ].join(" ")}
                    >
                      <span className="block font-mono text-[0.7rem] uppercase tracking-wider text-char/60">
                        {s.label}
                      </span>
                      <span className="block font-mono text-base text-char">
                        {formatPrice(s.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {priceLabel && (
            <p className="mt-5 font-mono text-3xl text-char">{priceLabel}</p>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 w-full items-center justify-center rounded-full bg-bq-red px-5 text-center font-display text-sm uppercase tracking-wide text-white transition-transform active:scale-[0.98]"
            >
              <Image
                src="/images/logo-whatsapp.webp"
                alt=""
                width={24}
                height={24}
                className="mr-2 h-6 w-6 rounded-full object-contain"
              />
              Order on WhatsApp
            </a>
          </div>

          <p className="mt-3 text-center font-mono text-[0.7rem] uppercase tracking-wider text-char/50">
            {when ?? cityLabel}
          </p>

          {/* ------------------------------------------- more from category */}
          {related.length > 0 && (
            <div className="mt-7 border-t border-char/10 pt-5">
              <p className="font-mono text-xs uppercase tracking-widest text-char/60">
                More like this
              </p>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {related.map(({ item: r, image }) => {
                  const rPrice =
                    r.price !== undefined
                      ? formatPrice(r.price)
                      : r.sizes?.length
                        ? `from ${formatPrice(Math.min(...r.sizes.map((s) => s.price)))}`
                        : undefined;

                  return (
                    <button
                      key={r.name}
                      type="button"
                      onClick={() => onSelectRelated?.(r)}
                      className="w-28 shrink-0 text-left transition-transform active:scale-95"
                    >
                      <span className="relative block aspect-square overflow-hidden rounded-xl bg-blush">
                        <SafeImage src={image} alt={r.name} sizes="7rem" />
                        {image === null && (
                          /*
                            A bare peach square sitting next to real photographs
                            looks like a thumbnail that didn't load. One quiet
                            hairline is enough to make it read as chosen, and it
                            echoes the rule used on the full-size no-photo cards
                            so the two states are visibly the same system.
                          */
                          <span
                            aria-hidden="true"
                            className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-bq-red/30"
                          />
                        )}
                      </span>
                      <span className="mt-1.5 block font-display text-[0.7rem] uppercase leading-tight text-char">
                        {r.name}
                      </span>
                      {rPrice && (
                        <span className="block font-mono text-xs text-bq-red">
                          {rPrice}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
