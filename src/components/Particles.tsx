export function Particles() {
  const dots = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {dots.map((_, i) => {
        const size = 2 + (i % 5);
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const delay = (i % 8) * 0.7;
        const isRed = i % 2 === 0;
        return (
          <span
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${6 + (i % 6)}s`,
              background: isRed ? "oklch(0.62 0.24 27)" : "oklch(0.7 0.18 35)",
              boxShadow: `0 0 ${size * 3}px oklch(0.62 0.24 27 / 60%)`,
            }}
          />
        );
      })}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.62 0.24 27) 1px, transparent 1px), linear-gradient(90deg, oklch(0.62 0.24 27) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}
