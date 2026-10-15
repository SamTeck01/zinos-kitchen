/** Illustrated pot of jollof. Swap for a real photo of Zino's jollof when available. */
export default function JollofPot({ className = "" }: { className?: string }) {
  const grains = Array.from({ length: 70 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180, r = 8 + ((i * 53) % 150);
    return { x: 200 + Math.cos(a) * r, y: 150 + Math.sin(a) * r * 0.32, rot: (i * 47) % 180 };
  });
  return (
    <svg viewBox="0 0 400 340" className={className} role="img" aria-label="A pot of smoky jollof rice">
      <ellipse cx="200" cy="318" rx="160" ry="14" fill="#14100E" opacity=".12" />
      <g className="steam" fill="none" stroke="#A50602" strokeWidth="5" strokeLinecap="round" opacity=".35">
        <path d="M150 90c-14-20 14-30 0-52" /><path d="M200 80c-14-20 14-30 0-56" /><path d="M250 90c-14-20 14-30 0-52" />
      </g>
      <rect x="10" y="168" width="40" height="18" rx="9" fill="#A50602" />
      <rect x="350" y="168" width="40" height="18" rx="9" fill="#A50602" />
      <path d="M40 150h320l-18 140c-3 18-16 28-34 28H92c-18 0-31-10-34-28Z" fill="#E52401" />
      <path d="M40 150h320l-3 24H43Z" fill="#A50602" />
      <ellipse cx="200" cy="150" rx="160" ry="38" fill="#C7380A" />
      <ellipse cx="200" cy="146" rx="150" ry="32" fill="#E8641C" />
      {grains.map((g, i) => (
        <ellipse key={i} cx={g.x} cy={g.y} rx="6" ry="2.4" transform={`rotate(${g.rot} ${g.x} ${g.y})`} fill={i % 3 ? "#F58A2A" : "#D94E12"} />
      ))}
      <circle cx="160" cy="140" r="7" fill="#3A8A2E" /><circle cx="236" cy="152" r="6" fill="#3A8A2E" />
      <circle cx="205" cy="134" r="6" fill="#F7A80B" /><circle cx="262" cy="138" r="5" fill="#F7A80B" />
      <path d="M120 200h160" stroke="#FEF1EB" strokeWidth="6" strokeLinecap="round" opacity=".25" />
    </svg>
  );
}
