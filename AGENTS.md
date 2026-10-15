# AGENTS.md — Zino's Kitchen demo site

Built from the BQ Cuisine codebase (same components, palette, type and rules).
Differences from BQ:

- **Zino's Cakes & Events** (WhatsApp 0807 906 0151, IG @zinoscakes_and_event).
  Source of truth: Zino's flyer + WhatsApp chat (15 Oct 2026). TWO offers:
  1. **Zino's Package** — the main, first focus. Jollof Rice & Chicken N3,000,
     Jollof Rice & Turkey N6,000 (Zino said 6k in chat; flyer's N5,000 is old).
     Extras: Jollof Rice 700, Coleslaw 600, Chicken 1,900, Plantain 600,
     Turkey 3,800. Ordered through the builder modal (`OrderForm.tsx`).
     **No fish, no beef** — Zino does not sell them with jollof.
  2. **Food by the litre** (`LITRES`, `Packages.tsx`) — below the package.
     No prices confirmed: cards ask on WhatsApp until `sizes` are added.
- Flyer lines (verbatim): "Pre-order on Thursdays & Fridays", "Morning delivery
  available on weekends to all locations on campus", "Delivery attracts
  additional charges".
- Photos are Zino's own (`public/zino/`). Never use stock or 3D/cartoon food.
- One city (Ilorin). There is no city switch. `City` keeps both keys only so
  BQ's city-aware components type-check; both point to the same data.
- The hero is a looping video (`components/HeroVideo.tsx`), not scroll frames.
  `ScrollFramesHero.tsx` is not used.
- Builder: `components/OrderForm.tsx` (pack → extras → order → details →
  WhatsApp).
- No Chowdeck. WhatsApp only.

The BQ rules below still apply where they make sense (mobile first, palette,
`formatPrice`, never invent facts, motion rules, accessibility, definition of
done). BQ-specific facts (outlets, Lagos prices, voice lines) do not.

---

## Stack

- Next.js (App Router) + TypeScript, strict
- Tailwind CSS
- `next/font/google` for fonts, `next/image` for all images
- No state library. React context for city selection is enough.
- No animation library. No Framer Motion, no GSAP, no Lenis, no Locomotive.

---

## Non-negotiables

**Mobile first, in this order: mobile → tablet → desktop.** Mobile is the
benchmark, not the fallback. Write the mobile layout first and add `sm:`/`lg:`
on top. Their customers are Unilorin students on mid-range Androids and metered
data.

**Motion must never hang on mobile.** That means:
- animate `transform` and `opacity` only — never `width`, `height`, `top`,
  `left`, `margin`, `box-shadow` or `filter` in a scroll handler
- never drive a scroll or drag animation through React state; write to the DOM
  through refs
- every scroll/resize listener is `{ passive: true }` and rAF-throttled
- respect `prefers-reduced-motion` in anything that moves

**No dark theme.** The page background is peach. There is no dark mode, no
near-black hero, no "premium dark" section. Their own graphics are bright and
warm and the site must look like it belongs to them.

**Never invent a fact.** No price, menu item, opening hour, phone number,
delivery fee, lead time, rating, review, testimonial, years-in-business,
customer count or brand colour that is not in `data/menu.ts` or this file. If a
layout needs a value that doesn't exist, **change the layout**. A wrong price in
front of the owner loses the pitch. This overrides every instruction about
making a section look complete.

Specifically forbidden strings, all of which came from earlier drafts and are
dead: `Ilorin's number one`, `#1 in Unilorin`, any star rating, any "trusted by
N customers", any invented item description, any opening hours.

---

## Palette — sampled from their real artwork. Authoritative. Do not extend.

```
--paper     #FEF1EB   page background (top of their peach gradient)
--blush     #FBD4C4   raised surfaces, alternating bands (bottom of that gradient)
--char      #14100E   headlines and body text
--bq-red    #E52401   primary — CTAs, prices, item names
--deep-red  #A50602   hover, depth, second accent
--gold      #F7A80B   badges and "hot" cues, used sparingly
```

Tailwind theme keys: `paper`, `blush`, `char`, `bq-red`, `deep-red`, `gold`.
Do not introduce a slate, zinc, stone or neutral grey. Muted text is
`text-char/70`.

---

## Typography

- **Display** — a heavy condensed sans in UPPERCASE for headlines and item
  names, matching their menu graphics. `Archivo` or `Anton` via
  `next/font/google`, exposed as `font-display`.
- **Body** — `Inter`, small, `text-char/70` for descriptions.
- **Numerals** — a monospace (`JetBrains Mono` or `Roboto Mono`) as `font-mono`.
  Every price on the site uses it so the price columns align.

---

## Voice

Their verbatim lines, safe to use:

- "Where Every Bite Tells a Story" (tagline)
- "WE ARE NOW OPEN IN UNILORIN"
- "Unmatched taste. Amazing meals. Premium burgers."
- "ORDER NOW · EXPRESS DELIVERY"

Confident, plain, slightly shouty, short sentences. Never corporate-startup
("elevate your dining experience", "curated culinary journey"). Never write
copy that makes a claim — only copy that describes.

---

## Money

Format every price through `formatPrice()` from `data/menu.ts`, which produces
`N8,500`. **`N`, not `₦`** — their own graphics do this and matching it is a
signal to the owner. Never hardcode a price string anywhere in a component.

---

## Data rules — read carefully, this is where builds go wrong

The single source of truth is `data/menu.ts`. Its shape:

```ts
type MenuItem = {
  name: string;
  desc?: string;
  price?: number;                              // single price
  sizes?: { label: string; price: number }[];  // OR two sizes
  descPending?: boolean;
};
```

1. **`price` and `sizes` are mutually exclusive.** Some items have `price`, some
   have `sizes` and no `price` at all. Every component that renders an item must
   handle both. An item with `sizes` renders one row per size, or a single row
   with both prices — never a blank or `NaN`. The four Lagos wraps and Ilorin's
   Smoky Beef Wrap are all `sizes`-only, so getting this wrong breaks visible
   rows.
2. **Check `=== undefined`, never `=== null`.** These fields are optional, not
   nullable.
3. **`descPending: true` means we have the price but not the description.**
   Render the name and price and nothing else. Do not write a description for
   it. Do not render the words "description pending".
4. **Category ids differ per city.** Loaded Fries is under `burgers` in BOTH
   cities, but at different prices (Ilorin ₦8,500, Lagos ₦12,000). There is no
   `loaded-fries` category and **no `signature` category** — `signature` was a
   label we invented and it has been deleted, because BQ's own headline names
   burgers as the hero ("Unmatched taste. Amazing meals. Premium burgers.").
   Do not reintroduce a signature category, badge, or label anywhere. Never
   hardcode a category id — always map over what the current city returns.
   `burgers` is first in ILORIN and must stay first.
5. **`PACKAGES` is Ilorin-only.** When the city is Lagos, the packages section
   must not render Ilorin's tiers. Hide the section or show a short line
   inviting an enquiry.
6. **`LOCATIONS` has three entries across two cities.** Two Ilorin, one Lagos
   (Ajah). Never emit Ilorin or Kwara in structured data for the Ajah address.
7. **The WhatsApp number comes from the selected city**, never a constant.

---

## The city switch is the point

Ilorin and Lagos publish **different prices for the same items** — Loaded Fries
is `N8,500` in Ilorin and `N12,000` in Lagos, a 29% gap; Toasties, wraps and
burgers differ by 20–29%. This is the commercial argument the whole pitch rests
on, so the switch must be genuinely live with both real price sets, and changing
city must visibly change prices, locations and the WhatsApp number.

Implementation: React context in `data/cityContext.tsx` exposing
`useCity() → { city, setCity, menu, locations }`, persisted to `localStorage`.

**Rehydrate from `localStorage` inside `useEffect`, never during render** — a
read during render causes a hydration mismatch. Default to `ilorin` on first
paint. `CitySwitch` is an inline two-option toggle. No modal, no geolocation
prompt, no IP lookup.

---

## Files that are hand-written — drop in, never generate or rewrite

- `components/ScrollFramesHero.tsx` — the canvas frame-scrubbing hero
- `components/FoodCardDeck.tsx` — the turning swipe cards
- `data/menu.ts`

If a task seems to need one of these changed, stop and say so instead. They
encode mobile performance decisions that are easy to undo by accident.

### `ScrollFramesHero.tsx` — how to use it without touching it

It takes exactly two props: `children` (the overlay) and `label` (the accessible
name). Its `children` slot sits **above** the canvas, and that is the only slot.

**Nothing renders behind the food.** There is no large wordmark, no oversized
background type, no layer under the canvas. The reference design this layout came
from has huge lettering that the bowl overlaps — we are deliberately not copying
it, because it is the single element that makes the reference read as a Japanese
restaurant, and BQ's mark already lives in `Header.tsx`. So do not ask for a
behind-canvas slot, do not use a negative z-index to try to get under the canvas,
and do not add a second children prop. If a layout idea needs something behind the
food, the idea is wrong, not the component.

It publishes scroll progress as the CSS custom property `--hero-p` (0 → 1) on its
own section. Overlay children animate in pure CSS off that variable, e.g.
`opacity: calc(1 - var(--hero-p) / 0.35)`. Never add a scroll listener alongside
it, never drive the overlay from React state, and never redefine `SCROLL_VH`.

---

## Accessibility floor

Every tappable target ≥ 44px. Real `<button>` and `<a>` elements, never a
`div` with `onClick`. The canvas hero has a text alternative. Focus rings stay
visible. `lang="en-NG"`.

## Definition of done for any task

`npx tsc --noEmit` clean, `next build` clean, no console errors, and it was
checked at 390px wide before any wider viewport.
