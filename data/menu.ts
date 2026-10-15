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

/* ---------------------------------------------------- NORMAL MENU (plates) */

export const ZINO: MenuCategory[] = [
  {
    id: "jollof",
    label: "Jollof Rice",
    items: [
      { name: "Jollof Rice", desc: "A plate of smoky jollof rice", price: 2500 },
      { name: "Jollof Rice & Chicken", desc: "Jollof rice, fried chicken", price: 5000 },
      { name: "Jollof Rice & Fish", desc: "Jollof rice, fried fish", price: 5500 },
      { name: "Jollof Rice & Beef", desc: "Jollof rice, beef", price: 4500 },
    ],
  },
  {
    id: "proteins",
    label: "Proteins",
    items: [
      { name: "Fried Chicken", price: 2500 },
      { name: "Fried Fish", price: 3000 },
      { name: "Beef", price: 2000 },
    ],
  },
  {
    id: "sides",
    label: "Sides",
    items: [
      { name: "Fried Plantain", price: 1000 },
      { name: "Coleslaw", price: 800 },
    ],
  },
];

/* ------------------------------------------------------ FOOD BY THE LITRE */
/* Separate from the plates, like BQ's platters/packages. Bulk food sold per
   litre, ordered during the week and cooked on Saturday. */

const L = (l1: number, l2: number, l3: number, l5: number) => [
  { label: "1 Litre", price: l1 },
  { label: "2 Litres", price: l2 },
  { label: "3 Litres", price: l3 },
  { label: "5 Litres", price: l5 },
];

export const LITRES: MenuItem[] = [
  { name: "Jollof Rice", sizes: L(4000, 7500, 11000, 18000) },
  { name: "Fried Rice", sizes: L(4500, 8500, 12500, 20000) },
  { name: "Stew", sizes: L(5000, 9500, 14000, 22000) },
  { name: "Beans", sizes: L(3500, 6500, 9500, 15000) },
  { name: "Amala", sizes: L(3000, 5500, 8000, 13000) },
  { name: "Eba", sizes: L(2500, 4500, 6500, 10500) },
  { name: "Fufu", sizes: L(3000, 5500, 8000, 13000) },
  { name: "Iyan (Pounded Yam)", sizes: L(4000, 7500, 11000, 18000) },
];

export const LITRE_IMAGES: Record<string, string | null> = {
  "Jollof Rice": "/crops/rice.webp",
};

export const LOCATIONS = {
  ilorin: [
    {
      name: "Zino's Kitchen",
      area: "Ilorin",
      landmark: "Ilorin, Kwara", // TODO: pickup point
      whatsapp: "2340000000000", // TODO: Zino's real number
      display: "0000 000 0000",
    },
  ],
  lagos: [
    {
      name: "Zino's Kitchen",
      area: "Ilorin",
      landmark: "Ilorin, Kwara",
      whatsapp: "2340000000000",
      display: "0000 000 0000",
    },
  ],
} as const;

export const MENUS: Record<City, MenuCategory[]> = { ilorin: ZINO, lagos: ZINO };

export const TAGLINE = "Jollof Rice & Food by the Litre";
export const INSTAGRAM = "https://instagram.com/"; // TODO: Zino's handle

export const formatPrice = (n: number) => `N${n.toLocaleString("en-NG")}`;

/* ------------------------------------------------- plate builder + Saturdays */

export type Option = { id: string; name: string; price: number; img?: string };
export const WHATSAPP = LOCATIONS.ilorin[0].whatsapp;
export const CITY = "Ilorin";
/** Orders close Friday 6pm for Saturday's cook. */
export const CUTOFF = { weekday: 5, hour: 18 };

/** Plate builder: a plate of jollof, then a protein and sides. */
export const BASE: Option = { id: "jollof", name: "Jollof Rice", price: 2500 };
export const PROTEINS: Option[] = [
  { id: "none", name: "No protein", price: 0 },
  { id: "chicken", name: "Chicken", price: 2500, img: "/crops/chicken.webp" },
  { id: "fish", name: "Fish", price: 3000, img: "/crops/fish.webp" },
  { id: "beef", name: "Beef", price: 2000 },
];
export const SIDES: Option[] = [
  { id: "plantain", name: "Plantain", price: 1000, img: "/crops/plantain.webp" },
  { id: "coleslaw", name: "Coleslaw", price: 800, img: "/crops/coleslaw.webp" },
];

export function nextCookDay(now = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  const cutoff = new Date(d);
  cutoff.setDate(d.getDate() - (6 - CUTOFF.weekday));
  cutoff.setHours(CUTOFF.hour, 0, 0, 0);
  if (now >= cutoff) d.setDate(d.getDate() + 7);
  d.setHours(0, 0, 0, 0);
  return d;
}
export const fmtDay = (d: Date) => d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
