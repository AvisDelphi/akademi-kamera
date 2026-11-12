// components/auth/Field.js — label + input teks + pesan error inline (UIUX_GUIDELINE §8.2).
import { inputClass, labelClass } from "@/components/lms/ui";

export default function Field({ id, label, error, hint, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${inputClass} mt-1.5 ${error ? "!border-danger-fg" : ""}`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger-fg">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs font-medium text-tinta-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
