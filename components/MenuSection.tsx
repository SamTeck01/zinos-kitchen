"use client";
import { useEffect, useState } from "react";
import Section from "./Section";
import ItemModal from "./ItemModal";
import BrandPlaceholder from "./BrandPlaceholder";
import { FoodImage, imageFor } from "@/lib/slug";
import { formatPrice, type MenuItem, type MenuCategory } from "@/data/menu";
import { useCity } from "../data/cityContext";

const price = (item: MenuItem) => item.price !== undefined ? formatPrice(item.price) : item.sizes?.length ? `from ${formatPrice(Math.min(...item.sizes.map((size) => size.price)))}` : "";

type Props = { categories?: MenuCategory[]; id?: string; eyebrow?: string; title?: string; when?: string };

export default function MenuSection({ categories, id = "menu", eyebrow = "This Saturday's pot", title = "THE MENU", when }: Props = {}) {
  const { menu: cityMenu, locations } = useCity();
  const menu = categories ?? cityMenu;
  const cityLabel = "Ilorin";
  const [view, setView] = useState<"cards" | "list">("cards");
  const [selected, setSelected] = useState<MenuItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("zk-view");
    if (saved === "cards" || saved === "list") {
      // View preference must rehydrate after the server-default first paint.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(saved);
    }
  }, []);

  const choose = (next: "cards" | "list") => { setView(next); localStorage.setItem("zk-view", next); };
  const category = menu.find((entry) => entry.items.some((item) => item.name === selected?.name));
  const related = category?.items.filter((item) => item.name !== selected?.name).slice(0, 6).map((item) => ({ item, image: imageFor(item.name) })) ?? [];
  const src = selected ? imageFor(selected.name) : null;

  return <><Section id={id} eyebrow={eyebrow} title={title} tone="paper"><div className="mb-8 flex justify-end">{(["cards", "list"] as const).map((option) => <button key={option} onClick={() => choose(option)} aria-pressed={view === option} className={`min-h-11 border border-char/20 px-4 font-mono text-xs uppercase ${view === option ? "bg-bq-red text-white" : ""}`}>{option}</button>)}</div><div className="space-y-12">{menu.map((entry) => <div id={`${id}-${entry.id}`} key={entry.id}><h3 className="mb-4 font-display text-2xl uppercase text-bq-red">{entry.label}</h3><div className={view === "cards" ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" : ""}>{entry.items.map((item) => { const image = imageFor(item.name); const meta = entry.label.toUpperCase(); return <button key={item.name} onClick={() => setSelected(item)} className={view === "cards" ? "relative aspect-[4/5] overflow-hidden rounded-2xl border border-char/10 bg-paper text-left transition-transform active:scale-[0.98]" : "flex min-h-14 w-full items-center gap-3 border-b border-char/15 py-2 text-left active:bg-blush"}>{view === "cards" ? image ? <><FoodImage src={image} alt={item.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" className="object-cover"/><span className="absolute inset-x-0 bottom-0 border-t border-paper/40 bg-paper/70 p-3 backdrop-blur-sm"><span className="block font-display text-sm uppercase leading-tight text-char">{item.name}</span><span className="mt-1 block font-mono text-sm text-bq-red">{price(item)}</span></span></> : <><BrandPlaceholder /><span className="relative z-10 flex h-full w-full flex-col items-center justify-center p-4 text-center"><span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-char/50">{meta}</span><span className="mt-3 font-display uppercase text-char">{item.name}</span><span className="my-4 h-px w-10 bg-bq-red/30"/><span className="font-mono text-sm text-bq-red">{price(item)}</span></span></> : <>{image && <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg"><FoodImage src={image} alt={item.name} fill sizes="56px" className="object-cover"/></span>}<span className="min-w-0"><span className="block font-display text-sm uppercase text-char">{item.name}</span><span className="font-mono text-sm text-bq-red">{price(item)}</span></span><span className="flex-1 border-b border-dotted border-char/25"/></>}</button>; })}</div></div>)}</div></Section><ItemModal item={selected} images={src ? [src] : []} related={related} cityLabel={cityLabel} when={when ?? category?.label} whatsapp={locations[0].whatsapp} onClose={() => setSelected(null)} onSelectRelated={setSelected}/></>;
}
