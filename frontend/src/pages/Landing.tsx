import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Icon, type IconName } from '../components/icons'
import { useUIStore } from '../store/ui'

interface Sector {
  icon: IconName
  title: string
  body: string
  to?: string // undefined = placeholder for future development
}

const SECTORS: Sector[] = [
  {
    icon: 'home',
    title: 'Residential',
    body: 'Homes and multifamily buildings — HVAC, water heating, and appliance demand flexibility.',
  },
  {
    icon: 'sites',
    title: 'Commercial',
    body: 'Offices, retail, schools, and hotels — DF potential, field performance, and benchmarking.',
    to: '/overview',
  },
  {
    icon: 'industry',
    title: 'Industrial & Water',
    body: 'Industrial processes, agricultural pumping, and water systems demand flexibility.',
  },
]

function SectorCard({ sector }: { sector: Sector }) {
  const inner = (
    <>
      <div
        className="flex items-center justify-center rounded-lg"
        style={{
          width: 64,
          height: 64,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
        }}
      >
        <Icon name={sector.icon} size={34} />
      </div>
      <div className="text-[26px] font-semibold tracking-tight text-text" style={{ lineHeight: 1.2 }}>
        {sector.title}
      </div>
      <p className="text-[14px] leading-relaxed text-text-muted">{sector.body}</p>
      {sector.to ? (
        <span className="mt-auto text-[14px] font-medium text-accent">Enter →</span>
      ) : (
        <span
          className="mt-auto w-fit rounded-full px-3 py-1 text-[12px] font-medium text-text-faint"
          style={{ background: 'var(--bg-subtle)' }}
        >
          Coming soon
        </span>
      )}
    </>
  )

  const base =
    'flex min-h-[260px] flex-col items-start gap-4 rounded-lg p-7 transition-all'
  const style = {
    border: '0.5px solid var(--border)',
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow)',
  }

  if (sector.to) {
    return (
      <Link
        to={sector.to}
        className={`${base} hover:-translate-y-0.5`}
        style={style}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        {inner}
      </Link>
    )
  }
  return (
    <div className={base} style={{ ...style, opacity: 0.75, cursor: 'default' }}>
      {inner}
    </div>
  )
}

export default function Landing() {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  useEffect(() => {
    document.title = 'DF Toolkit'
  }, [])

  return (
    <div className="flex min-h-full flex-col bg-page">
      {/* Berkeley Lab dark-teal masthead */}
      <header
        className="flex items-center justify-between px-8 py-4"
        style={{ background: 'var(--brand-dark)' }}
      >
        <span className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold uppercase" style={{ letterSpacing: '0.06em' }}>
            <span style={{ color: '#FFFFFF' }}>DF</span>{' '}
            <span style={{ color: '#6FBEC9' }}>Toolkit</span>
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'rgba(190, 215, 221, 0.75)' }}
          >
            Berkeley Lab
          </span>
        </span>
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

      <main className="flex flex-1 items-center justify-center px-8 pb-16">
        <div className="w-full max-w-5xl">
          <div className="mb-10 text-center">
            <h1
              className="title-gradient mx-auto text-[40px] font-semibold tracking-tight"
              style={{ lineHeight: 1.15 }}
            >
              Demand Flexibility Toolkit
            </h1>
            <p className="mt-3 text-[16px] text-text-muted">
              Assess, quantify, and benchmark building demand flexibility. Choose a sector to begin.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {SECTORS.map((s) => (
              <SectorCard key={s.title} sector={s} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
