/**
 * No-photo state for a dish: a frosted glass panel with the brand name faded
 * behind it. Stands in until Zino sends a real photo of that dish.
 * Fills its (relative) parent.
 */
export default function BrandPlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = { sm: "text-lg", md: "text-[1.7rem]", lg: "text-5xl" }[size];
  return (
    <span aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_90%_at_20%_10%,#FEF1EB_0%,#FBD4C4_55%,#F6B9A3_100%)]">
      <span className={`absolute inset-0 flex -rotate-12 scale-125 flex-col items-center justify-center gap-1 font-display font-extrabold uppercase leading-[0.85] text-bq-red/15 ${text}`}>
        <span>Zinosfood</span>
        <span className="translate-x-6">Zinosfood</span>
        <span>Zinosfood</span>
      </span>
      <span className="absolute inset-[8%] rounded-[inherit] rounded-xl border border-white/60 bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-[3px]" />
    </span>
  );
}
