/**
 * Zino's Kitchen — single source of truth.
 *
 * ⚠️ PLACEHOLDERS: every price, the WhatsApp number and the cut-off below are
 * stand-ins until Zino confirms them. Change them here and only here.
 */

export type Size = { litres: number; price: number };
export type Dish = { id: string; name: string; desc?: string; sizes: Size[] };

export const WHATSAPP = "2340000000000"; // TODO: Zino's real number, intl format, no +
export const CITY = "Ilorin"; // TODO: confirm
/** Orders close this many hours before Saturday cook day (Friday 6pm by default). */
export const CUTOFF = { weekday: 5, hour: 18 }; // 5 = Friday

export const MENU: Dish[] = [
  {
    id: "jollof",
    name: "Party Jollof Rice",
    desc: "Smoky, firewood-style jollof. Cooked fresh every Saturday.",
    sizes: [
      { litres: 1, price: 4000 },
      { litres: 2, price: 7500 },
      { litres: 3, price: 11000 },
      { litres: 5, price: 18000 },
    ],
  },
  {
    id: "jollof-chicken",
    name: "Jollof + Chicken",
    desc: "Jollof rice with fried chicken pieces.",
    sizes: [
      { litres: 1, price: 6500 },
      { litres: 2, price: 12000 },
      { litres: 3, price: 17500 },
    ],
  },
];

export const formatPrice = (n: number) => `N${n.toLocaleString("en-NG")}`;

/** The next Saturday cook day. If today is past the cut-off, skip a week. */
export function nextCookDay(now = new Date()): Date {
  const d = new Date(now);
  const daysToSat = (6 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + daysToSat);
  const cutoff = new Date(d);
  cutoff.setDate(d.getDate() - (6 - CUTOFF.weekday));
  cutoff.setHours(CUTOFF.hour, 0, 0, 0);
  if (now >= cutoff) d.setDate(d.getDate() + 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
