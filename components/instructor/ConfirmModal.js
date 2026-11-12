"use client";
// components/instructor/ConfirmModal.js — modal konfirmasi (UIUX_GUIDELINE §8.10) memakai <dialog>
// bawaan browser: fokus terkunci di dalam, Esc menutup, dan fokus kembali ke pemicu.
import { useEffect, useRef } from "react";
import { AlertIcon } from "@/components/icons";
import { btn } from "@/components/lms/ui";

export default function ConfirmModal({ open, title, description, confirmLabel, danger = false, busy = false, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(event) => event.target === ref.current && !busy && onCancel()}
      className="m-auto w-[calc(100%-2rem)] max-w-[440px] rounded-3xl border-0 bg-white p-0 text-tinta-900 shadow-e3 backdrop:bg-tinta-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-8">
        {danger && (
          <span className="grid size-12 place-items-center rounded-full bg-danger-bg text-danger-fg">
            <AlertIcon size={24} />
          </span>
        )}
        <h2 className={`${danger ? "mt-4" : ""} text-xl font-semibold leading-7`}>{title}</h2>
        {description && <p className="mt-2 text-sm leading-[22px] text-tinta-500">{description}</p>}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className={btn("ghost", "m")}>
            Batal
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={btn(danger ? "danger" : "dark", "m")}>
            {busy ? "Memproses…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
