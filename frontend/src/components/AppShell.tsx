import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '../store/ui'
import { Footer } from './Footer'
import { Icon } from './icons'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  return (
    <div className="flex min-h-full flex-col bg-page">
      {/* Berkeley Lab dark-teal masthead */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-3"
        style={{ background: 'var(--brand-dark)', boxShadow: 'var(--shadow)' }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 32,
              height: 32,
              background: 'rgba(190, 215, 221, 0.16)',
              color: 'var(--brand-light)',
            }}
          >
            <Icon name="potential" size={18} />
          </div>
          <span className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold uppercase" style={{ letterSpacing: '0.06em' }}>
              <span style={{ color: '#FFFFFF' }}>DF</span>{' '}
              <span style={{ color: '#6FBEC9' }}>Toolkit</span>
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: 'rgba(190, 215, 221, 0.75)' }}
            >
              Commercial
            </span>
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
          className="flex items-center justify-center rounded transition-colors"
          style={{
            width: 32,
            height: 32,
            border: '0.5px solid rgba(190, 215, 221, 0.35)',
            background: 'transparent',
            color: 'var(--brand-light)',
          }}
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
        </button>
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
