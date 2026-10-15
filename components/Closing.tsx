"use client";
import OrderButton from "./OrderButton";

/**
 * The Chowdeck button used to live here as a separate outline pill, gated on
 * CHOWDECK[city]. It's gone — OrderButton's sheet is now the single place both
 * channels are offered, so there is one order flow on the whole site instead of
 * two that behave differently.
 */
export default function Closing() {
  return (
    <section id="closing" className="bg-paper">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-14 text-center sm:px-8">
        <p className="font-display text-3xl font-extrabold uppercase leading-tight text-char">Get in touch with us<br /><span className="text-bq-red">for tasty jollof rice</span></p>
        <OrderButton label="ORDER NOW" className="mt-6" />
      </div>
    </section>
  );
}
