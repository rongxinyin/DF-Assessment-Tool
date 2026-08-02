import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './icons'

interface NavItem {
  label: string
  to: string
  enabled: boolean
  icon: IconName
}

// Roadmap pages ship as disabled rows ("soon") so the IA is visible from day one.
const NAV: NavItem[] = [
  { label: 'Overview', to: '/overview', enabled: true, icon: 'overview' },
  { label: 'DF Potential', to: '/potential', enabled: true, icon: 'potential' },
  { label: 'Sites', to: '/sites', enabled: false, icon: 'sites' },
  { label: 'Field Performance', to: '/performance', enabled: true, icon: 'performance' },
  { label: 'Benchmarking', to: '/benchmarking', enabled: true, icon: 'benchmark' },
  { label: 'Reports', to: '/reports', enabled: false, icon: 'reports' },
]

function NavRow({ item }: { item: NavItem }) {
  if (!item.enabled) {
    return (
      <span
        className="flex items-center justify-between rounded text-[14px] text-text-faint"
        style={{ padding: '8px 12px', cursor: 'default' }}
        title="Coming soon"
      >
        <span className="flex items-center gap-2.5">
          <Icon name={item.icon} />
          {item.label}
        </span>
        <span className="text-[11px] text-text-faint">soon</span>
      </span>
    )
  }
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 rounded text-[14px] transition-colors ${
          isActive ? '' : 'hover:bg-[var(--bg-subtle)]'
        }`
      }
      style={({ isActive }) => ({
        padding: '8px 12px',
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        background: isActive ? 'var(--accent-soft)' : undefined,
        fontWeight: isActive ? 500 : 400,
      })}
    >
      <Icon name={item.icon} />
      {item.label}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside
      className="sticky top-[57px] h-[calc(100vh-57px)] w-52 shrink-0 overflow-y-auto px-3 py-4"
      style={{ borderRight: '0.5px solid var(--border)', background: 'var(--bg-card)' }}
    >
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </nav>
    </aside>
  )
}
