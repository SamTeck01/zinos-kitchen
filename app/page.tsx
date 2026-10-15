import JollofPot from "../components/JollofPot";
import OrderForm from "../components/OrderForm";
import CookDay from "../components/CookDay";
import { CITY } from "../data/menu";

const steps = [
  ["Pick your litres", "Choose how many litres of jollof you want."],
  ["Order by Friday", "Send your order on WhatsApp before the cut-off."],
  ["Saturday, it's cooked", "Fresh pot, cooked on the day and delivered or picked up."],
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-char/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <a href="#top" className="font-display text-xl font-extrabold uppercase text-bq-red">Zino&apos;s Kitchen</a>
          <a href="#order" className="flex min-h-11 items-center rounded-full bg-bq-red px-5 font-display font-extrabold uppercase text-white hover:bg-deep-red">Order</a>
        </div>
      </header>
      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-14 pt-8 sm:px-8 lg:grid-cols-2 lg:py-20">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-deep-red">Cooked every Saturday · {CITY}</p>
            <h1 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.9] sm:text-7xl">Jollof rice<br /><span className="text-bq-red">by the litre.</span></h1>
            <p className="mx-auto mt-4 max-w-md text-char/70 lg:mx-0">Order this week. We cook on Saturday. Next pot: <strong className="text-char"><CookDay /></strong>.</p>
            <a href="#order" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-bq-red px-8 font-display text-lg font-extrabold uppercase text-white hover:bg-deep-red">Order your litres</a>
          </div>
          <JollofPot className="bob order-1 mx-auto w-[88%] max-w-md lg:order-2 lg:max-w-none" />
        </section>

        <section className="bg-blush px-4 py-12 sm:px-8">
          <ol className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
            {steps.map(([t, d], i) => (
              <li key={t}><span className="font-mono text-bq-red">0{i + 1}</span><h2 className="font-display text-2xl font-extrabold uppercase">{t}</h2><p className="text-sm text-char/70">{d}</p></li>
            ))}
          </ol>
        </section>

        <section id="order" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-8">
          <h2 className="mb-6 font-display text-4xl font-extrabold uppercase sm:text-5xl">Order for <span className="text-bq-red">Saturday</span></h2>
          <OrderForm />
        </section>
      </main>
      <footer className="border-t border-char/10 px-4 py-8 text-center text-sm text-char/70">© Zino&apos;s Kitchen</footer>
    </>
  );
}
