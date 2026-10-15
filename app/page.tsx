import { LOCATIONS, ZINO, INSTAGRAM } from "@/data/menu";
import Closing from "../components/Closing";
import Footer from "../components/Footer";
import HeroOverlay from "../components/HeroOverlay";
import Section from "../components/Section";
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
      <Section id="order" eyebrow="The menu · Pre-order Thursdays & Fridays" title="ZINO'S WEEKEND PACKAGE" tone="paper">
        <OrderForm />
      </Section>
      <Packages />
      <Closing />
      <Footer />
    </>
  );
}
