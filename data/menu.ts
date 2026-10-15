/**
 * Zino's Kitchen — menu data, in the same shape as BQ Cuisine's data/menu.ts
 * so every BQ component renders it unchanged.
 *
 * ⚠️ PLACEHOLDERS: every price, the WhatsApp number, the city and the cut-off
 * are stand-ins until Zino confirms them. Change them here and only here.
 *
 * Zino sells jollof BY THE LITRE, cooked once a week on Saturday. Litres are
 * modelled as `sizes`, which every BQ component already renders.
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

const LITRES = (l1: number, l2: number, l3: number, l5: number) => [
  { label: "1 Litre", price: l1 },
  { label: "2 Litres", price: l2 },
  { label: "3 Litres", price: l3 },
  { label: "5 Litres", price: l5 },
];

export const ZINO: MenuCategory[] = [
  {
    id: "jollof",
    label: "Jollof by the Litre",
    items: [
      { name: "Party Jollof Rice", desc: "Smoky jollof rice, cooked fresh on Saturday", sizes: LITRES(4000, 7500, 11000, 18000) },
      { name: "Jollof + Chicken", desc: "Jollof rice, fried chicken", sizes: LITRES(6500, 12000, 17500, 28000) },
      { name: "Jollof + Fish", desc: "Jollof rice, fried fish, plantain", sizes: LITRES(7000, 13000, 19000, 30000) },
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

/** BQ's Packages section reads these. Zino has no packages, so it is replaced by the plate builder. */
export const PACKAGES: MenuItem[] = [];
export const PACKAGE_IMAGES: Record<string, string | null> = {};

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

export const TAGLINE = "Jollof Rice by the Litre";
export const INSTAGRAM = "https://instagram.com/"; // TODO: Zino's handle

export const formatPrice = (n: number) => `N${n.toLocaleString("en-NG")}`;

/* ------------------------------------------------- plate builder + Saturdays */

export type Option = { id: string; name: string; price: number; img?: string };
export const WHATSAPP = LOCATIONS.ilorin[0].whatsapp;
export const CITY = "Ilorin";
/** Orders close Friday 6pm for Saturday's cook. */
export const CUTOFF = { weekday: 5, hour: 18 };

export const RICE: Option[] = ZINO[0].items[0].sizes!.map((s) => ({ id: s.label, name: s.label, price: s.price }));
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
