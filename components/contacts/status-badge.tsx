import { statusMeta } from '@/lib/utils'
import type { ContactStatus } from '@/lib/types'

export default function StatusBadge({ status }: { status: ContactStatus }) {
  const m = statusMeta(status)
  return (
    <span
      className="inline-flex items-center gap-[7px] px-[10px] py-1 rounded-full text-xs font-medium"
      style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
    >
      <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  )
}
