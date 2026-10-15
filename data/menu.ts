/**
 * Zino's Kitchen — single source of truth.
 *
 * ⚠️ PLACEHOLDERS: every price, the WhatsApp number, the city and the cut-off
 * below are stand-ins until Zino confirms them. Change them here and only here.
 */

export type Option = { id: string; name: string; price: number; img?: string };

export const WHATSAPP = "2340000000000"; // TODO: Zino's real number, intl format, no +
export const CITY = "Ilorin"; // TODO: confirm
/** Orders close Friday 6pm for Saturday's cook. */
export const CUTOFF = { weekday: 5, hour: 18 };

/** Jollof is sold by the litre. */
export const RICE: Option[] = [
  { id: "1l", name: "1 Litre", price: 4000 },
  { id: "2l", name: "2 Litres", price: 7500 },
  { id: "3l", name: "3 Litres", price: 11000 },
  { id: "5l", name: "5 Litres", price: 18000 },
];

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

export const formatPrice = (n: number) => `N${n.toLocaleString("en-NG")}`;

/** The next Saturday cook day. Past Friday's cut-off, it rolls to the week after. */
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

export const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
