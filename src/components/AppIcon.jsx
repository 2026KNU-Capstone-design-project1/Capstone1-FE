const ICONS = {
  dashboard: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  risk: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4.5M12 17h.01" /></>,
  video: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3V9Z" /></>,
  history: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  report: <><path d="M6 3h9l4 4v14H6V3Z" /><path d="M15 3v5h5M9 12h6M9 16h6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.36a1.7 1.7 0 0 0-1.87.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.52-1H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.96 4.64 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.52 1H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /></>,
  site: <><path d="M3 20h18M5 20V9l7-5v16M12 10h7v10M8 11h1M8 15h1M15 13h1M15 16h1" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  chevronDown: <path d="m8 10 4 4 4-4" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  warning: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4.5M12 17h.01" /></>,
  flame: <path d="M13 2s1 4-2 7c-2-2-3-3-3-5-3 3-5 6-5 10a9 9 0 0 0 18 0c0-5-3-8-5-10 0 3-1 5-3 6 1-3 0-6 0-8Z" />,
  document: <><path d="M6 3h9l4 4v14H6V3Z" /><path d="M15 3v5h5M9 12h6M9 16h6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l4 2" /></>,
  play: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m10 8 5 4-5 4V8Z" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2Z" /></>,
  lock: <><rect x="4" y="10" width="16" height="12" rx="1" /><path d="M7 10V7a5 5 0 0 1 10 0v3M12 15v3" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <path d="m3 3 18 18M10.6 5.1A12 12 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.1 6.1A19 19 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.5 4.6-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
};

export default function AppIcon({ name, className = '', strokeWidth = 1.7 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
