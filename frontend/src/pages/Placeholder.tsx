import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import type { IconName } from '../components/icons'

export default function Placeholder({ icon, title, note }: { icon: IconName; title: string; note: string }) {
  return (
    <>
      <PageHeader icon={icon} title={title} />
      <Card>
        <p className="text-[14px] text-text-muted">{note}</p>
      </Card>
    </>
  )
}
