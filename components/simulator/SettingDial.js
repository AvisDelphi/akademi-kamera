// components/simulator/SettingDial.js
// One exposure setting: big value readout, notched slider, and step buttons (1/3 stop each).
export default function SettingDial({ id, label, effect, values, index, format, onChange, disabled = false }) {
  const step = (d) => onChange(Math.min(values.length - 1, Math.max(0, index + d)));
  return (
    <div className="border-t border-rule py-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-muted">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-3xl font-semibold tabular">
          {format(values[index])}
        </output>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={disabled || index === 0}
          className="h-9 w-9 shrink-0 rounded border border-rule text-lg disabled:opacity-40"
          aria-label={`${label} turun satu langkah`}
        >
          −
        </button>
        <input
          id={id}
          type="range"
          min={0}
          max={values.length - 1}
          step={1}
          value={index}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={format(values[index])}
          className="dial"
          style={{ "--tick": `calc(100% / ${values.length - 1})` }}
        />
        <button
          type="button"
          onClick={() => step(1)}
          disabled={disabled || index === values.length - 1}
          className="h-9 w-9 shrink-0 rounded border border-rule text-lg disabled:opacity-40"
          aria-label={`${label} naik satu langkah`}
        >
          +
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">{effect}</p>
    </div>
  );
}
