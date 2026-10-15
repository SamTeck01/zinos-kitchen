import CravingCategories from "../components/CravingCategories";
import Favourites from "../components/Favourites";
import MenuSection from "../components/MenuSection";
import { LOCATIONS, ZINO } from "@/data/menu";
import Locations from "../components/Locations";
import Closing from "../components/Closing";
import Footer from "../components/Footer";
import HeroOverlay from "../components/HeroOverlay";
import Section from "../components/Section";
import OrderForm from "../components/OrderForm";

export default function Home() {
  const loc = LOCATIONS.ilorin[0];
  const restaurant = { "@type": "Restaurant", name: "Zino's Kitchen", telephone: `+${loc.whatsapp}`, servesCuisine: "Nigerian", address: { "@type": "PostalAddress", addressLocality: "Ilorin", addressRegion: "Kwara" } };
  const menu = { "@type": "Menu", name: "Zino's Kitchen Menu", hasMenuSection: ZINO.map((c) => ({ "@type": "MenuSection", name: c.label, hasMenuItem: c.items.map((i) => ({ "@type": "MenuItem", name: i.name, offers: i.price !== undefined ? { "@type": "Offer", price: i.price, priceCurrency: "NGN" } : undefined })) })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [restaurant, menu] }) }} />
      <HeroOverlay />
      <CravingCategories />
      <Favourites />
      <Section id="order" eyebrow="Order for Saturday" title="BUILD YOUR PLATE" tone="paper">
        <OrderForm />
      </Section>
      <MenuSection />
      <Locations />
      <Closing />
      <Footer />
    </>
  );
}
