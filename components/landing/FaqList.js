// components/landing/FaqList.js — daftar tanya-jawab (accordion native <details>, bisa dipakai keyboard).
import { ChevronDownIcon } from "@/components/icons";

export default function FaqList({ items }) {
  return (
    <div className="divide-y divide-tinta-100 overflow-hidden rounded-3xl border border-tinta-100 bg-white">
      {items.map(({ q, a }) => (
        <details key={q} className="group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-base font-semibold leading-6 transition-colors duration-[120ms] hover:bg-sprout-50 [&::-webkit-details-marker]:hidden">
            {q}
            <ChevronDownIcon size={20} className="shrink-0 text-tinta-400 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="max-w-[68ch] px-6 pb-5 text-sm leading-[22px] text-tinta-500">{a}</p>
        </details>
      ))}
    </div>
  );
}
