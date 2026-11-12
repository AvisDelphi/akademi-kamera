"use client";
// components/instructor/MarkdownEditor.js — editor Markdown dua panel (tulis | pratinjau), UIUX_GUIDELINE §8.2.
// Toolbar hanya memuat sintaks yang didukung components/lms/Markdown.js.
import { useRef, useState } from "react";
import Markdown from "@/components/lms/Markdown";
import { inputClass } from "@/components/lms/ui";

const TOOLS = [
  { label: "Judul", title: "Judul", kind: "line", prefix: "## " },
  { label: "B", title: "Tebal", kind: "wrap", before: "**", after: "**", placeholder: "teks tebal" },
  { label: "i", title: "Miring", kind: "wrap", before: "*", after: "*", placeholder: "teks miring" },
  { label: "Daftar", title: "Daftar", kind: "line", prefix: "- " },
  { label: "Kutipan", title: "Kutipan", kind: "line", prefix: "> " },
  { label: "Kode", title: "Kode", kind: "wrap", before: "`", after: "`", placeholder: "kode" },
  { label: "Tautan", title: "Tautan", kind: "wrap", before: "[", after: "](https://)", placeholder: "teks tautan" },
];

export default function MarkdownEditor({ id, value, onChange }) {
  const ref = useRef(null);
  const [view, setView] = useState("tulis"); // hanya memengaruhi layar kecil

  function apply(tool) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    let next;
    let caret;
    if (tool.kind === "wrap") {
      const selected = value.slice(start, end) || tool.placeholder;
      next = value.slice(0, start) + tool.before + selected + tool.after + value.slice(end);
      caret = [start + tool.before.length, start + tool.before.length + selected.length];
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end || start);
      const prefixed = block.split("\n").map((line) => tool.prefix + line).join("\n");
      next = value.slice(0, lineStart) + prefixed + value.slice(end || start);
      caret = [lineStart + prefixed.length, lineStart + prefixed.length];
    }
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret[0], caret[1]);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="toolbar" aria-label="Format teks" className="flex flex-wrap gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.title}
              type="button"
              title={tool.title}
              onClick={() => apply(tool)}
              className={`h-9 min-w-9 rounded-lg border border-tinta-200 bg-white px-2.5 text-xs font-semibold hover:bg-tinta-50 ${tool.title === "Miring" ? "italic" : ""}`}
            >
              {tool.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Tampilan" className="inline-flex rounded-xl bg-tinta-100 p-1 lg:hidden">
          {[["tulis", "Tulis"], ["pratinjau", "Pratinjau"]].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={`h-8 rounded-lg px-3 text-xs font-semibold ${view === key ? "bg-white shadow-e1" : "text-tinta-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className={view === "tulis" ? "" : "hidden lg:block"}>
          <label htmlFor={id} className="sr-only">Isi materi (Markdown)</label>
          <textarea
            ref={ref}
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={18}
            spellCheck="false"
            className={`${inputClass} h-auto min-h-[420px] py-3 font-mono text-[13px] leading-6`}
            placeholder="Tulis materi dengan Markdown…"
          />
        </div>
        <div className={`${view === "pratinjau" ? "" : "hidden lg:block"} min-h-[420px] overflow-auto rounded-xl border border-tinta-100 bg-white p-5`}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">Pratinjau</p>
          {value.trim() ? <Markdown text={value} /> : <p className="text-sm text-tinta-400">Pratinjau muncul di sini.</p>}
        </div>
      </div>
    </div>
  );
}
