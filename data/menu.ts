/**
 * Zino's Kitchen — menu data, in the same shape as BQ Cuisine's data/menu.ts
 * so every BQ component renders it unchanged.
 *
 * ⚠️ PLACEHOLDERS: every price, the WhatsApp number, the city and the cut-off
 * are stand-ins until Zino confirms them. Change them here and only here.
 *
 * Two offers, like BQ's menu + platters:
 *   ZINO    normal plates of jollof rice, proteins and sides
 *   LITRES  bulk food by the litre (jollof, fried rice, stew, swallow…),
 *           ordered in the week and cooked on Saturday. Litres are `sizes`.
 */

/** Zino is in one city. The second key only exists so BQ's city-aware components type-check. */
export type City = "ilorin" | "lagos";

export type MenuItem = {
  name: string;
  desc?: string;
  price?: number;
  sizes?: { label: string; price: number }[];
  includes?: string[];
  descPending?: boolean;
};

export type MenuCategory = { id: string; label: string; items: MenuItem[] };

/* ------------------------------------------------- ZINO'S PACKAGE (main) */
/* Source: Zino's flyer + WhatsApp chat, 15 Oct 2026.
   Jollof Rice with Chicken N3,000 (flyer). With Turkey N6,000 (Zino in chat,
   overrides the flyer's N5,000). Extras are the flyer's EXTRAS list.
   Zino does NOT sell fish or beef with jollof. */

export const ZINO: MenuCategory[] = [
  {
    id: "package",
    label: "Zinosfood Package",
    items: [
      { name: "Jollof Rice & Chicken", price: 3000 },
      { name: "Jollof Rice & Turkey", price: 6000 },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    items: [
      { name: "Jollof Rice", price: 700 },
      { name: "Coleslaw", price: 600 },
      { name: "Chicken", price: 1900 },
      { name: "Plantain", price: 600 },
      { name: "Turkey", price: 3800 },
    ],
  },
];

/* ------------------------------------------------- WEEKDAY SPECIALS */
/* Source: Zino's WhatsApp, 27 Oct 2026. One special per weekday, Monday to
   Thursday, no Friday. The weekend package stays the main offer.
   Wednesday is pepper soup: catfish N4,000, goat meat N6,000, white rice +N1,000
   (sold by the bowl — Zino said not to write "litre"). The other days have no
   price yet, so they ask on WhatsApp. day: 1 = Monday … 4 = Thursday. */

export const WEEKDAY_SPECIALS: MenuCategory[] = [
  { id: "monday", label: "Monday Special", items: [{ name: "Gizdodo", desc: "Chicken gizzard, fried plantain, pepper sauce" }] },
  { id: "tuesday", label: "Tuesday Special", items: [{ name: "Ewa Agoyin", desc: "Mashed beans, agoyin pepper sauce" }] },
  {
    id: "wednesday",
    label: "Wednesday Special",
    items: [
      { name: "Catfish Pepper Soup", desc: "Catfish, pepper soup broth", price: 4000 },
      { name: "Goat Meat Pepper Soup", desc: "Goat meat, pepper soup broth", price: 6000 },
      { name: "White Rice (add-on)", desc: "Plain white rice to go with your pepper soup", price: 1000 },
    ],
  },
  { id: "thursday", label: "Thursday Special", items: [{ name: "Ofada Rice with Ofada Sauce", desc: "Ofada rice, ofada sauce" }] },
];

/* ------------------------------------------------------ FOOD BY THE LITRE */
/* Separate from the package. No prices confirmed yet, so none are shown:
   each card asks on WhatsApp. Add `sizes` here when Zino sends them. */

export const LITRES: MenuItem[] = [
  { name: "Jollof Rice" },
  { name: "Fried Rice" },
  { name: "Stew" },
  { name: "Soup" },
  { name: "Beans" },
  { name: "Amala" },
  { name: "Eba" },
  { name: "Fufu" },
  { name: "Iyan (Pounded Yam)" },
];

export const LOCATIONS = {
  ilorin: [
    {
      name: "Zinosfood Cakes & Events",
      area: "On campus",
      landmark: "Morning delivery on weekends to all locations on campus",
      whatsapp: "2348079060151",
      display: "0807 906 0151",
    },
  ],
  lagos: [
    {
      name: "Zinosfood Cakes & Events",
      area: "On campus",
      landmark: "Morning delivery on weekends to all locations on campus",
      whatsapp: "2348079060151",
      display: "0807 906 0151",
    },
  ],
} as const;

export const MENUS: Record<City, MenuCategory[]> = { ilorin: ZINO, lagos: ZINO };

export const TAGLINE = "Jollof Rice with Chicken or Turkey";
export const INSTAGRAM = "https://instagram.com/zinoscakes_and_event";
export const INSTAGRAM_HANDLE = "@zinoscakes_and_event";
/** Flyer wording, verbatim. */
export const SCHEDULE = [
  "Pre-order on Thursdays & Fridays",
  "Morning delivery available on weekends to all locations on campus",
] as const;
export const DELIVERY_NOTE = "Delivery attracts additional charges";

export const formatPrice = (n: number) => `N${n.toLocaleString("en-NG")}`;

/* -------------------------------------------------------- plate builder */

export type Option = { id: string; name: string; price: number; img?: string };
export const WHATSAPP = LOCATIONS.ilorin[0].whatsapp;

const P = ZINO[0].items, E = ZINO[1].items;
export const PACKS: Option[] = [
  { id: "chicken", name: P[0].name, price: P[0].price!, img: "/zino/chicken.webp" },
  { id: "turkey", name: P[1].name, price: P[1].price!, img: "/zino/turkey.webp" },
];
export const EXTRAS: Option[] = E.map((e) => ({ id: e.name.toLowerCase(), name: e.name, price: e.price! }));

/** Pre-order closes end of Friday; delivery is the weekend after. */
export function nextDeliveryDay(now = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  d.setHours(0, 0, 0, 0);
  if (now.getDay() === 6) d.setDate(d.getDate() + 7);
  return d;
}
export const fmtDay = (d: Date) => d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
