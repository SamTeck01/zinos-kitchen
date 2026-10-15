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
        <div className="mx-auto max-w-3xl px-5 pb-14 pt-4 sm:px-8 lg:pt-10">
          <h2 className="font-display text-3xl font-extrabold uppercase text-char sm:text-4xl">Zino&apos;s weekend package</h2>
          <p className="mb-5 mt-1 text-char/70">Tap a pack to order. Add extras on the next step.</p>
          <OrderForm />
        </div>
      </section>
      <Packages />
      <Closing />
      <Footer />
    </>
  );
}
