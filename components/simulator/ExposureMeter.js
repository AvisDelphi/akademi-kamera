// components/simulator/ExposureMeter.js
// In-viewfinder style exposure scale from −3 to +3 EV in 1/3-stop ticks.
const RANGE = 3;
const W = 600;
const PAD = 24;
const xFor = (ev) => PAD + ((ev + RANGE) / (2 * RANGE)) * (W - 2 * PAD);

const fmt = (n) => Math.abs(n).toLocaleString("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export default function ExposureMeter({ offset, status }) {
  const clamped = Math.max(-RANGE - 0.25, Math.min(RANGE + 0.25, offset));
  const color = status === "correct" ? "var(--color-correct)" : status === "over" ? "var(--color-over)" : "var(--color-under)";
  const ticks = [];
  for (let i = -RANGE * 3; i <= RANGE * 3; i++) ticks.push(i / 3);

  const text =
    status === "correct"
      ? `Exposure tepat (${Math.abs(offset) < 0.05 ? "±" : offset > 0 ? "+" : "−"}${fmt(offset)} EV)`
      : status === "over"
        ? `Terlalu terang ${fmt(offset)} stop`
        : `Terlalu gelap ${fmt(offset)} stop`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} 56`} className="w-full" aria-hidden="true">
        {ticks.map((t) => {
          const whole = Number.isInteger(Math.round(t * 1000) / 1000);
          return (
            <line key={t} x1={xFor(t)} x2={xFor(t)} y1={whole ? 14 : 20} y2={30} stroke="var(--color-muted)" strokeWidth={whole ? 2 : 1} />
          );
        })}
        {[-3, -2, -1, 0, 1, 2, 3].map((n) => (
          <text key={n} x={xFor(n)} y={48} textAnchor="middle" fontSize="13" fill="var(--color-muted)" className="tabular">
            {n > 0 ? `+${n}` : n === 0 ? "0" : `−${-n}`}
          </text>
        ))}
        <path
          d={`M ${xFor(clamped) - 8} 0 L ${xFor(clamped) + 8} 0 L ${xFor(clamped)} 12 Z`}
          fill={color}
          style={{ transition: "transform 120ms" }}
        />
      </svg>
      <p className="font-display text-lg font-semibold" style={{ color }} aria-live="polite">
        {text}
      </p>
    </div>
  );
}
