"use client";
import { useEffect, useRef } from "react";

/** Muted looping hero clip. Paused for reduced-motion and when off-screen, so it never costs a phone battery. */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { v.pause(); return; }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="aspect-[3/4] w-full object-cover"
      autoPlay muted loop playsInline preload="metadata"
      poster="/media/jollof-poster.jpg"
      aria-label="Zino's jollof rice with chicken and turkey, plantain and coleslaw"
    >
      <source src="/media/jollof.webm" type="video/webm" />
      <source src="/media/jollof.mp4" type="video/mp4" />
    </video>
  );
}
