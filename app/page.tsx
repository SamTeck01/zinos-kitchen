import { LOCATIONS, ZINO, INSTAGRAM } from "@/data/menu";
import Closing from "../components/Closing";
import Footer from "../components/Footer";
import HeroOverlay from "../components/HeroOverlay";
import OrderForm from "../components/OrderForm";
import Packages from "../components/Packages";

export default function Home() {
  const loc = LOCATIONS.ilorin[0];
  const restaurant = { "@type": "Restaurant", name: "Zino's Cakes & Events", telephone: `+${loc.whatsapp}`, servesCuisine: "Nigerian", sameAs: INSTAGRAM, address: { "@type": "PostalAddress", addressLocality: "Ilorin", addressRegion: "Kwara" } };
  const menu = { "@type": "Menu", name: "Zino's Menu", hasMenuSection: ZINO.map((c) => ({ "@type": "MenuSection", name: c.label, hasMenuItem: c.items.map((i) => ({ "@type": "MenuItem", name: i.name, offers: i.price !== undefined ? { "@type": "Offer", price: i.price, priceCurrency: "NGN" } : undefined })) })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [restaurant, menu] }) }} />
      <HeroOverlay />
      <section id="order" className="scroll-mt-16 bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-bq-red">The menu</p>
          <h2 className="mt-3 font-display text-3xl uppercase text-char sm:text-4xl">Zino&apos;s weekend package</h2>
          <p className="mb-6 mt-2 text-char/70">Tap a pack to order. Add extras on the next step.</p>
          <OrderForm />
        </div>
      </section>
      <Packages />
      <Closing />
      <Footer />
    </>
  );
}
