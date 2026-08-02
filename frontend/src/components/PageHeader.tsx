import { useEffect, type ReactNode } from 'react'
import { Icon, type IconName } from './icons'

// Page icon in a soft accent square + gradient title + muted subtitle.
export function PageHeader({
  icon,
  title,
  subtitle,
  action,
  className = 'mb-4',
}: {
  icon: IconName
  title: ReactNode
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (typeof title === 'string') document.title = `${title} · DF Toolkit`
    return () => {
      document.title = 'DF Toolkit'
    }
  }, [title])

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 40, height: 40, background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <Icon name={icon} size={20} />
        </div>
        <div>
          <h1 className="title-gradient text-[24px] font-semibold tracking-tight" style={{ lineHeight: 1.15 }}>
            {title}
          </h1>
          {subtitle && <p className="text-[13px] text-text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
