import { INSTAGRAM, INSTAGRAM_HANDLE, LOCATIONS, SCHEDULE, WHATSAPP } from "@/data/menu";

/**
 * Not dark. AGENTS.md rules out any near-black section — their own artwork is
 * warm and bright and a black footer at the bottom of a peach page reads as a
 * different website. `blush` is the bottom of their real gradient.
 *
 * The extra bottom padding on mobile keeps the last line clear of the floating
 * order pill in OrderBar.
 */
export default function Footer() {
  return (
    <footer className="bg-blush px-5 pb-28 pt-12 text-char lg:px-12 lg:pb-12">
      <p className="font-display text-3xl font-extrabold uppercase text-bq-red">Zinosfood</p>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-char/70">Cakes &amp; Events</p>
      <div className="mt-6 space-y-1 text-sm text-char/70">
        <p>{SCHEDULE[0]}. {SCHEDULE[1]}.</p>
        <p>WhatsApp <a className="underline" href={`https://wa.me/${WHATSAPP}`}>{LOCATIONS.ilorin[0].display}</a> · Instagram <a className="underline" href={INSTAGRAM}>{INSTAGRAM_HANDLE}</a></p>
      </div>
      <p className="mt-10 text-xs text-char/50">
        Demo site.
      </p>
    </footer>
  );
}
