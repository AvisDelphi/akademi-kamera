// components/simulator/ExposureMeter.js
// Skala exposure −3 … +3 EV per 1/3 stop (UIUX_GUIDELINE §4.5, §8.14). Status dibedakan oleh
// warna, panah/centang, dan teks, tidak hanya warna.
import { AlertIcon, ArrowDownIcon, ArrowUpIcon, CheckIcon } from "@/components/icons";

const RANGE = 3;
const W = 600;
const PAD = 24;
const xFor = (ev) => PAD + ((ev + RANGE) / (2 * RANGE)) * (W - 2 * PAD);

/** Pecahan sepertiga stop: 0,67 → "⅔", 1,33 → "1⅓". */
export function formatThirds(value) {
  const thirds = Math.round(Math.abs(value) * 3);
  const whole = Math.floor(thirds / 3);
  const frac = ["", "⅓", "⅔"][thirds % 3];
  if (!whole && !frac) return "0";
  return whole ? `${whole}${frac}` : frac;
}

const signed = (value) => {
  const text = formatThirds(value);
  if (text === "0") return "0";
  return `${value < 0 ? "−" : "+"}${text}`;
};

const STATUS = {
  correct: { fill: "#7fa855", text: "text-sprout-700", Icon: CheckIcon },
  over: { fill: "#8e6a12", text: "text-warn-fg", Icon: ArrowUpIcon },
  under: { fill: "#8e6a12", text: "text-warn-fg", Icon: ArrowDownIcon },
};

export default function ExposureMeter({ offset, status }) {
  const clamped = Math.max(-RANGE - 0.25, Math.min(RANGE + 0.25, offset));
  const { fill, text, Icon } = STATUS[status] ?? STATUS.correct;
  const ticks = [];
  for (let i = -RANGE * 3; i <= RANGE * 3; i++) ticks.push(i / 3);

  const label =
    status === "correct"
      ? "Exposure tepat"
      : status === "over"
        ? `Berlebih ${formatThirds(offset)} stop`
        : `Kurang ${formatThirds(offset)} stop`;

  return (
    <div className="rounded-3xl border border-tinta-100 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">Exposure meter</p>
        <p className="text-sm font-semibold tabular text-tinta-900">{signed(offset)} EV</p>
      </div>

      <svg viewBox={`0 0 ${W} 56`} className="mt-2 w-full" aria-hidden="true">
        <rect x={xFor(-0.5)} y="14" width={xFor(0.5) - xFor(-0.5)} height="16" rx="4" fill="#e0f8c7" />
        {ticks.map((t) => {
          const whole = Number.isInteger(Math.round(t * 1000) / 1000);
          return (
            <line key={t} x1={xFor(t)} x2={xFor(t)} y1={whole ? 14 : 20} y2={30} stroke="#737d94" strokeWidth={whole ? 2 : 1} />
          );
        })}
        {[-3, -2, -1, 0, 1, 2, 3].map((n) => (
          <text key={n} x={xFor(n)} y={50} textAnchor="middle" fontSize="13" fill="#556078" className="tabular">
            {n > 0 ? `+${n}` : n === 0 ? "0" : `−${-n}`}
          </text>
        ))}
        <path d={`M ${xFor(clamped) - 8} 0 L ${xFor(clamped) + 8} 0 L ${xFor(clamped)} 12 Z`} fill={fill} />
      </svg>

      <p className={`mt-1 flex items-center gap-2 text-base font-semibold ${text}`} aria-live="polite">
        <Icon size={20} />
        {label}
      </p>
    </div>
  );
}
