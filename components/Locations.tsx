"use client";

import { useCity } from "../data/cityContext";
import Section from "./Section";

export default function Locations() {
  const { locations } = useCity();

  return (
    <Section id="locations" eyebrow="Pickup & delivery" title="WHERE TO FIND ZINO" tone="paper">
      <div className="grid gap-4 sm:grid-cols-2">
        {locations.map((location) => (
          <div key={location.name} className="bg-blush p-5">
            <h3 className="font-display text-2xl uppercase">{location.name}</h3>
            <p className="mt-2 text-char/70">{location.landmark}</p>
            <p className="mt-3 font-mono">{location.display}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className="min-h-11 border border-char/20 px-4 py-3 font-mono text-xs uppercase"
                href={`tel:+${location.whatsapp}`}
              >
                Call
              </a>
              <a
                className="min-h-11 border border-char/20 px-4 py-3 font-mono text-xs uppercase"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.landmark)}`}
              >
                Show on map
              </a>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
