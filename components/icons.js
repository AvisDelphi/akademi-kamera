// components/icons.js — line icons (stroke 1.75, rounded) per UIUX_GUIDELINE §7.1.
// Colour follows the surrounding text (currentColor).

function Icon({ size = 20, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ApertureIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.3 3.3 9 12.5M20.6 9.4 10 9.5M18.6 18 13.3 8.8M9.7 20.7 15 11.5M3.4 14.6l10.6-.1M5.4 6l5.3 9.2" />
    </Icon>
  );
}

export function BookIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 6.5C10.3 5.2 7.9 4.5 4 4.5v13c3.9 0 6.3.7 8 2 1.7-1.3 4.1-2 8-2v-13c-3.9 0-6.3.7-8 2Z" />
      <path d="M12 6.5v13" />
    </Icon>
  );
}

export function CameraIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Icon>
  );
}

export function PhotoSearchIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20 11V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6" />
      <path d="m4 16 4.5-4.5 3 3" />
      <circle cx="9" cy="9" r="1.25" />
      <circle cx="17" cy="16" r="3" />
      <path d="m19.2 18.2 1.8 1.8" />
    </Icon>
  );
}

export function GridIcon(props) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

export function LoginIcon(props) {
  return (
    <Icon {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l4 4-4 4M14 12H4" />
    </Icon>
  );
}

export function ChartIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V9M16 16v-6" />
    </Icon>
  );
}

export function ArrowRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icon>
  );
}
