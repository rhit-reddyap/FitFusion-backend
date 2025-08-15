// src/components/Sparkline.jsx
export default function Sparkline({ data = [], height = 44, width = 560 }) {
  const vals = data.map(v => (Number.isFinite(Number(v)) ? Number(v) : null));
  const finite = vals.filter(v => Number.isFinite(v));
  const min = finite.length ? Math.min(...finite) : 0;
  const max = finite.length ? Math.max(...finite) : 1;
  const pad = (max - min) * 0.1 || 1;
  const yMin = min - pad;
  const yMax = max + pad;

  const pts = vals.map((v, i) => {
    const x = (i / Math.max(vals.length - 1, 1)) * (width - 8) + 4;
    const y =
      v == null
        ? null
        : height - ((v - yMin) / Math.max(yMax - yMin, 1)) * (height - 8) - 4;
    return { x, y };
  });

  const d = pts.reduce((acc, p, i) => {
    if (!p || p.y == null) return acc;
    return acc + (i === 0 || pts[i - 1].y == null ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`);
  }, "");

  return (
    <svg width={width} height={height} className="block">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
