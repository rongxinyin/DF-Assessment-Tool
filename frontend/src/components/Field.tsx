import type { ReactNode } from 'react'

// Labeled form control: 12px muted label above the input/select.
export function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-text-muted">{label}</span>
      {children}
    </label>
  )
}
