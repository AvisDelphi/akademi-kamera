// components/landing/HeroIllustration.js — flat two-colour hero illustration (UIUX_GUIDELINE §7.3):
// Ink camera with a Sprout diaphragm on a Mint shape, plus sample settings in camera notation (§5.3).

import { CheckIcon } from "@/components/icons";

const BLADES = [0, 60, 120, 180, 240, 300];

export default function HeroIllustration() {
  return (
    <figure
      role="img"
      aria-label="Ilustrasi kamera dengan setelan f/5.6, 1/250, ISO 200 dan exposure tepat"
      className="relative mx-auto aspect-square w-full max-w-md"
    >
      <svg viewBox="0 0 400 400" className="size-full" aria-hidden="true">
        <rect x="24" y="24" width="352" height="352" rx="48" fill="#E0F8C7" />
        <circle cx="318" cy="92" r="36" fill="#CDEAAE" />
        {/* camera body */}
        <rect x="72" y="138" width="256" height="168" rx="24" fill="#202734" />
        <path d="M150 138 166 110h68l16 28Z" fill="#202734" />
        <rect x="92" y="122" width="36" height="16" rx="6" fill="#36415A" />
        <rect x="276" y="158" width="32" height="14" rx="7" fill="#B7D894" />
        {/* lens */}
        <circle cx="200" cy="222" r="70" fill="#36415A" />
        <circle cx="200" cy="222" r="56" fill="#202734" />
        <g transform="translate(200 222)">
          <circle r="46" fill="#B7D894" />
          {BLADES.map((angle) => (
            <path
              key={angle}
              transform={`rotate(${angle})`}
              d="M0 -46 A46 46 0 0 1 39.8 -23 L9 -5 L-9 -5 Z"
              fill="#7FA855"
              stroke="#B7D894"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ))}
          <circle r="11" fill="#202734" />
        </g>
      </svg>

      <span className="absolute top-[14%] left-0 rounded-xl border border-tinta-100 bg-white px-3 py-2 text-sm font-semibold text-tinta-900 shadow-e2 tabular sm:-left-4">
        f/5.6
      </span>
      <span className="absolute top-[30%] right-0 rounded-xl border border-tinta-100 bg-white px-3 py-2 text-sm font-semibold text-tinta-900 shadow-e2 tabular sm:-right-4">
        1/250
      </span>
      <span className="absolute bottom-[22%] left-0 rounded-xl border border-tinta-100 bg-white px-3 py-2 text-sm font-semibold text-tinta-900 shadow-e2 tabular sm:-left-4">
        ISO 200
      </span>
      <span className="absolute right-[8%] bottom-[4%] inline-flex items-center gap-1.5 rounded-full border border-sprout-200 bg-sprout-100 px-3 py-1.5 text-xs font-semibold text-sprout-700 shadow-e2">
        <CheckIcon size={14} />
        Exposure tepat · <span className="tabular">0 EV</span>
      </span>
    </figure>
  );
}
