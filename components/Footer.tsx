
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
      <p className="font-display text-3xl font-extrabold uppercase text-bq-red">Zino&apos;s Kitchen</p>
      <p className="mt-1 text-char/70">Jollof rice by the litre. Cooked every Saturday.</p>
      <p className="mt-6 text-sm text-char/70">Ilorin, Kwara</p>
      <p className="mt-10 text-xs text-char/50">
        Demo site. Food photos: Bukky658, DromoTetteh, Noahalorwu (CC BY-SA, Wikimedia Commons).
      </p>
    </footer>
  );
}
