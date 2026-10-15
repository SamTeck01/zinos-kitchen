"use client";
import Section from "./Section";
import OrderButton from "./OrderButton";

/**
 * The Chowdeck button used to live here as a separate outline pill, gated on
 * CHOWDECK[city]. It's gone — OrderButton's sheet is now the single place both
 * channels are offered, so there is one order flow on the whole site instead of
 * two that behave differently.
 */
export default function Closing() {
  return (
    <Section id="closing" eyebrow="One more thing" title="STILL HUNGRY?" tone="blush">
      <div className="flex flex-col items-center text-center">
        <p className="font-display text-3xl uppercase leading-tight text-char">
          Plates or litres. Order on WhatsApp.
        </p>
        <OrderButton label="ORDER ON WHATSAPP" className="mt-6" />
      </div>
    </Section>
  );
}
