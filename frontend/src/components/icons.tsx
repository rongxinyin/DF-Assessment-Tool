// Minimal inline SVG icon set (stroke = currentColor), pezzrr pattern.

export type IconName =
  | 'overview'
  | 'potential'
  | 'sites'
  | 'performance'
  | 'benchmark'
  | 'reports'
  | 'sun'
  | 'moon'
  | 'home'
  | 'industry'

const PATHS: Record<IconName, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  potential: <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />,
  sites: (
    <>
      <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" />
      <path d="M14 9h5a1 1 0 0 1 1 1v11" />
      <path d="M2 21h20" />
      <path d="M7 8h2M7 12h2M7 16h2M17 13h1M17 17h1" />
    </>
  ),
  performance: (
    <>
      <path d="M3 3v18h18" />
      <path d="m6 15 4-5 3 3 5-7" />
    </>
  ),
  benchmark: (
    <>
      <path d="M5 21V10M12 21V4M19 21v-8" />
      <path d="M3 21h18" />
    </>
  ),
  reports: (
    <>
      <path d="M6 2h9l4 4v16H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M14 2v5h5M9 13h6M9 17h6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  industry: (
    <>
      <path d="M2 21h20" />
      <path d="M4 21V11l5 3v-3l5 3v-3l6 3.5V21" />
      <path d="M17 7.5c1.2 0 2-.8 2-1.9C19 4.5 18.2 3.7 17 3.7c-.2-1-1-1.7-2-1.7s-1.9.7-2 1.7" />
      <path d="M15 9.2c.6-.5 1.6-.5 2.2 0" />
    </>
  ),
}

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}
