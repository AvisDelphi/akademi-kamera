"use client";
// components/auth/PasswordField.js — input kata sandi dengan tombol tampil/sembunyikan (UIUX_GUIDELINE §8.2).
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { inputClass, labelClass } from "@/components/lms/ui";

export default function PasswordField({ id, label, value, onChange, onBlur, autoComplete, error, hint }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${inputClass} pr-12 ${error ? "!border-danger-fg" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-tinta-500 hover:bg-tinta-100"
        >
          {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
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
