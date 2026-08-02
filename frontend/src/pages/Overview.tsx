import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/icons'
import { PageHeader } from '../components/PageHeader'

const PILLARS: { icon: IconName; title: string; body: string; to: string }[] = [
  {
    icon: 'potential',
    title: 'DF Potential',
    body: 'Estimate HVAC demand-flexibility potential from EnergyPlus-derived regressions: temperature reset (GTA) and RTU duty cycling.',
    to: '/potential',
  },
  {
    icon: 'performance',
    title: 'Field Performance',
    body: 'Browse post-processed DR event performance from field studies, and quantify shed against weather-regression and X-of-Y baselines (DR v4 engine).',
    to: '/performance',
  },
  {
    icon: 'benchmark',
    title: 'Benchmarking',
    body: 'Compare sites against cohorts of like buildings (type × vintage × climate × size) on normalized DF metrics.',
    to: '/benchmarking',
  },
]

// Whole card is a link (same affordance as the landing sector cards).
function PillarCard({ pillar }: { pillar: (typeof PILLARS)[number] }) {
  return (
    <Link
      to={pillar.to}
      className="flex min-h-[210px] flex-col gap-2 rounded-lg p-5 transition-all hover:-translate-y-0.5"
      style={{
        border: '0.5px solid var(--border)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ width: 36, height: 36, background: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        <Icon name={pillar.icon} size={18} />
      </div>
      <h3 className="text-[15px] font-semibold text-text">{pillar.title}</h3>
      <p className="text-[13px] leading-relaxed text-text-muted">{pillar.body}</p>
      <span className="mt-auto text-[13px] font-medium text-accent">Open →</span>
    </Link>
  )
}

export default function Overview() {
  return (
    <>
      <PageHeader
        icon="overview"
        title="Commercial Sector"
        subtitle="Assess, quantify, and benchmark demand flexibility in commercial buildings"
      />
      <div className="grid grid-cols-3 gap-4">
        {PILLARS.map((p) => (
          <PillarCard key={p.title} pillar={p} />
        ))}
      </div>
    </>
  )
}
