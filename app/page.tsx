import OrderForm from "../components/OrderForm";
import CookDay from "../components/CookDay";
import HeroVideo from "../components/HeroVideo";
import { CITY } from "../data/menu";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-char/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <a href="#top" className="font-display text-xl font-extrabold uppercase tracking-tight text-bq-red">Zino&apos;s Kitchen</a>
          <a href="#order" className="press flex min-h-11 items-center rounded-full bg-char px-5 font-display font-extrabold uppercase text-white duration-150 hover:bg-deep-red">Order</a>
        </div>
      </header>
      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-20">
          <div className="relative overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-24px_rgba(165,6,2,0.5)] lg:order-2">
            <HeroVideo />
          </div>
          <div className="lg:order-1">
            <h1 className="text-balance font-display text-[3.4rem] font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-7xl lg:text-[5.5rem]">
              Jollof rice, <span className="text-bq-red">by the litre.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-char/70">
              Order during the week. Zino cooks one big smoky pot on Saturday and it goes out the same day. Next pot: <strong className="font-medium text-char"><CookDay /></strong>, {CITY}.
            </p>
            <a href="#order" className="press mt-7 inline-flex min-h-14 items-center rounded-full bg-bq-red px-8 font-display text-lg font-extrabold uppercase text-white duration-150 hover:bg-deep-red">Build your plate</a>
          </div>
        </section>

        <section className="bg-char px-4 py-10 text-paper sm:px-8">
          <ol className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
            {[
              ["Pick your litres", "1L for one, 5L for the whole house."],
              ["Order before Friday 6pm", "Your order goes straight to Zino on WhatsApp."],
              ["Eat on Saturday", "Cooked fresh that morning. Delivery or pickup."],
            ].map(([t, d]) => (
              <li key={t} className="border-t border-paper/20 pt-4">
                <h2 className="font-display text-2xl font-extrabold uppercase text-gold">{t}</h2>
                <p className="mt-1 text-sm text-paper/75">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="order" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-8 lg:py-24">
          <h2 className="mb-8 text-balance font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-[-0.02em] sm:text-6xl">
            Build your <span className="text-bq-red">plate</span>
          </h2>
          <OrderForm />
        </section>
      </main>
      <footer className="border-t border-char/10 px-4 py-8 text-center text-xs text-char/60">
        © Zino&apos;s Kitchen · Food photos: Bukky658, DromoTetteh, Noahalorwu (CC BY-SA, Wikimedia Commons)
      </footer>
    </>
  );
}
