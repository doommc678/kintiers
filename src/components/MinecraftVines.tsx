const LEAVES = [
  "left-0 top-8", "left-3 top-14", "left-0 top-20", "left-6 top-28",
  "left-3 top-36", "left-9 top-44", "left-6 top-52", "left-12 top-60",
];

export function MinecraftVines() {
  return (
    <div className="minecraft-vines" aria-hidden="true">
      <div className="vine-stem vine-stem-long">
        {LEAVES.map((position, index) => (
          <span key={position} className={`vine-leaf ${position} ${index % 2 ? "vine-leaf-bright" : ""}`} />
        ))}
      </div>
      <div className="vine-stem vine-stem-short">
        <span className="vine-leaf left-0 top-10" />
        <span className="vine-leaf vine-leaf-bright left-3 top-20" />
        <span className="vine-leaf left-0 top-28" />
      </div>
    </div>
  );
}