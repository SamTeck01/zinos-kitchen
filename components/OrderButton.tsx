"use client";

/**
 * OrderButton
 * -----------
 * Every "order" affordance on the site — the hero pill, the floating bar, the
 * closing section — is this one component. It is a channel picker, not a link:
 * tapping it opens a small sheet with Chowdeck and WhatsApp side by side.
 *
 * WHY A PICKER AND NOT TWO BUTTONS SIDE BY SIDE:
 * two equally-weighted CTAs in the hero makes the visitor choose before they've
 * decided to order at all, and it doubles the width of every CTA on a 360px
 * phone. One button gets the commitment; the sheet gets the mechanics.
 *
 * THE LOGOS ARE REAL FILES, NOT DRAWN HERE. Four assets exist: mono marks for
 * red surfaces and full-colour marks on white discs for paper surfaces. A green
 * mark on a red pill and a thin green ring directly on peach both fail. If an
 * asset is missing the icon degrades to a
 * neutral chip — deliberately, because a hand-drawn approximation of somebody
 * else's trademark looks wrong in a way the owner will notice. Drop the real
 * files in and they appear with no code change.
 *
 * CHOWDECK IS GATED ON `CHOWDECK[city]` IN data/external.ts, WHICH IS null.
 * While it's null the Chowdeck option says COMING SOON when tapped. It becomes a
 * real outbound link the moment a confirmed vendor URL lands in that file. Never
 * guess the URL — see the note there.
 */

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCity } from "../data/cityContext";
import { openPlateBuilder } from "./OrderForm";

/* --------------------------------------------------------------------- logo */

/**
 * next/image with `unoptimized` so a missing file is a plain 404 that fires
 * onError, rather than an optimizer error. Same fallback philosophy as
 * FoodCardDeck's CardImage: a designed empty state, not a broken one.
 */
function ChannelLogo({
  name,
  tone,
}: {
  name: "chowdeck" | "whatsapp";
  tone: "on-red" | "on-paper";
}) {
  const [failed, setFailed] = useState(false);
  const initial = name === "chowdeck" ? "CD" : "WA";
  const src = `/images/logo-${name}${tone === "on-red" ? "-mono" : ""}.webp`;
  const chip =
    tone === "on-red"
      ? "bg-white/25 text-white"
      : "bg-char/10 text-char/60";

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[0.6rem] ${chip}`}
      >
        {initial}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={tone === "on-red" ? 24 : 36}
      height={tone === "on-red" ? 24 : 36}
      unoptimized
      onError={() => setFailed(true)}
      className={tone === "on-red" ? "h-6 w-6 shrink-0 object-contain" : `h-9 w-9 shrink-0 rounded-full bg-white object-contain ${name === "whatsapp" ? "p-[3px]" : ""}`}
    />
  );
}

/* -------------------------------------------------------------------- sheet */

function ChannelSheet({
  onClose,
  whatsappHref,
  cityLabel,
}: {
  onClose: () => void;
  whatsappHref: string;
  cityLabel: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<Element | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement;

    // Scroll lock. Compensate for the scrollbar so the page doesn't jump.
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    panelRef.current
      ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
      ?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!f || f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
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
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [onClose]);

  const onBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const row =
    "flex min-h-14 w-full items-center gap-3 rounded-2xl px-5 text-left font-mono text-sm uppercase tracking-[0.1em]";

  /**
   * PORTALLED TO document.body ON PURPOSE. One of the callers is the floating
   * OrderBar, whose wrapper is `pointer-events-none`, faded to `opacity-0`,
   * translated, and `lg:hidden`. A sheet rendered inside that inherits every one
   * of those and is invisible and unclickable. Do not "simplify" this back into
   * an inline render.
   */
  return createPortal(
    <div
      onClick={onBackdrop}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-char/60 backdrop-blur-sm sm:items-center sm:p-6"
      style={{ animation: "bqFade 160ms ease-out" }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Choose how to order"
        className="w-full overflow-y-auto rounded-t-3xl bg-paper p-5 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-sm sm:rounded-3xl sm:pb-5"
        style={{ animation: "bqRise 220ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        <p className="font-display text-xl uppercase leading-tight text-char">
          How do you want to order?
        </p>
        <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-char/50">
          {cityLabel}
        </p>

        <div className="mt-5 space-y-3">
          <a href={whatsappHref} className={`${row} bg-bq-red text-white`}>
            <ChannelLogo name="whatsapp" tone="on-red" />
            Order via WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 min-h-11 w-full font-mono text-xs uppercase tracking-[0.2em] text-char/50"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ----------------------------------------------------------------- trigger */

export default function OrderButton({
  label = "ORDER NOW",
  variant = "solid",
  className = "",
}: {
  label?: string;
  /** `solid` is the brand-red pill. `bar` is the compact floating-bar pill. */
  variant?: "solid" | "bar";
  className?: string;
}) {
  const { city, locations } = useCity();
  const [open, setOpen] = useState(false);

  const cityLabel = "Ilorin";
  const msg = `Hi Zino's Kitchen, I'd like to order jollof for Saturday.`;
  const whatsappHref = `https://wa.me/${locations[0].whatsapp}?text=${encodeURIComponent(msg)}`;

  const shape =
    variant === "bar"
      ? "min-h-12 gap-2.5 px-5 text-xs"
      : "min-h-12 gap-3 px-6 text-sm";

  return (
    <>
      <button
        type="button"
        onClick={openPlateBuilder}
        aria-haspopup="dialog"
        className={`inline-flex items-center rounded-full bg-bq-red font-display uppercase tracking-wide text-white transition-transform active:scale-[0.97] ${shape} ${className}`}
      >
        <span>{label}</span>
        <ChannelLogo name="whatsapp" tone="on-red" />
      </button>

      {open && (
        <ChannelSheet
          onClose={() => setOpen(false)}
          whatsappHref={whatsappHref}
          cityLabel={`Ordering from ${cityLabel}`}
        />
      )}
    </>
  );
}
