import type { ReactNode } from 'react'

interface MetricTileProps {
  label: ReactNode
  value: ReactNode
  unit?: ReactNode
  className?: string
}

// --bg-subtle, no border, --radius. 13px muted label, 24px/500 number.
export function MetricTile({ label, value, unit, className = '' }: MetricTileProps) {
  return (
    <div className={`bg-subtle rounded p-4 ${className}`}>
      <div className="text-[13px] text-text-muted">{label}</div>
      <div className="mt-1 text-text" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.2 }}>
        {value}
        {unit && <span className="ml-1 text-[14px] font-normal text-text-muted">{unit}</span>}
      </div>
    </div>
  )
}

// Convenience wrapper: a 2-4 column grid of tiles with gap 12px.
export function MetricGrid({ cols = 2, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[cols]
  return (
    <div className={`grid ${colClass}`} style={{ gap: 12 }}>
      {children}
    </div>
  )
}
