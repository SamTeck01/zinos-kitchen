import Link from "next/link";

/**
 * The logo is their real one, keyed off its white background so it sits on the
 * peach page with no white box behind it. Two crops exist:
 *   logo-mark.webp  hat + BQ + Cuisine        — header, small sizes
 *   logo-full.webp  the above + the tagline   — footer, opengraph
 * The tagline inside the full logo is unreadable below ~90px tall, which is why
 * the header uses the cropped mark instead of scaling the whole thing down.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-char/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="#top"
          aria-label="Zinosfood — back to top"
          className="flex items-center"
        >
          <span className="leading-none"><span className="block font-display text-xl font-extrabold uppercase tracking-tight text-bq-red">Zinosfood</span><span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-char/70">Cakes &amp; Events</span></span>
        </Link>
        <a href="#order" className="flex min-h-11 items-center rounded-full bg-bq-red px-5 font-mono text-xs uppercase tracking-wider text-white hover:bg-deep-red">Order</a>
      </div>
    </header>
  );
}
