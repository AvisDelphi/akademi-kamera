// components/simulator/SettingDial.js
// Satu setelan exposure (UIUX_GUIDELINE §8.14): overline + nilai tabular, slider berskala takik,
// dan tombol langkah 1/3 stop. Slider bisa diatur dengan panah keyboard.
export default function SettingDial({ id, label, effect, values, index, format, onChange, disabled = false }) {
  const step = (d) => onChange(Math.min(values.length - 1, Math.max(0, index + d)));
  const stepButton =
    "grid size-11 shrink-0 place-items-center rounded-xl border border-tinta-200 bg-white text-lg font-semibold text-tinta-900 transition-colors duration-[120ms] hover:bg-tinta-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="border-t border-tinta-100 py-4 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">
          {label}
        </label>
        <output htmlFor={id} className="text-[28px] font-bold leading-8 tabular">
          {format(values[index])}
        </output>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={disabled || index === 0}
          className={stepButton}
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
          className={stepButton}
          aria-label={`${label} naik satu langkah`}
        >
          +
        </button>
      </div>
      <p className="mt-1 text-xs font-medium leading-4 text-tinta-500">{effect}</p>
    </div>
  );
}
