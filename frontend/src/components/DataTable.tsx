import type { ReactNode } from 'react'

// Token-styled table: muted uppercase header, hairline row borders.
export function DataTable({ headers, children }: { headers: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-text-faint"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Td({ children, num = false }: { children: ReactNode; num?: boolean }) {
  return (
    <td
      className={`whitespace-nowrap px-3 py-1.5 text-text ${num ? 'tabular-nums' : ''}`}
      style={{ borderBottom: '0.5px solid var(--border)' }}
    >
      {children}
    </td>
  )
}
