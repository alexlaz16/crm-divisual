import { LucideIcon } from 'lucide-react'
import Sparkline from './sparkline'

interface Props {
  label: string
  value: string
  delta: string
  sparkData: number[]
  Icon: LucideIcon
}

export default function KpiCard({ label, value, delta, sparkData, Icon }: Props) {
  return (
    <div
      className="flex flex-col gap-[13px] rounded-2xl p-5 pb-4"
      style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
    >
      <div className="flex items-center justify-between">
        <span className="inline-block w-[22px] h-[2px] rounded-sm" style={{ background: '#FAC51C' }} />
        <Icon size={17} style={{ color: 'rgba(245,245,245,0.34)' }} strokeWidth={1.5} />
      </div>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(245,245,245,0.45)' }}>
        {label}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-[31px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{value}</div>
        <Sparkline data={sparkData} />
      </div>
      <div className="text-xs font-medium" style={{ color: '#FAC51C' }}>{delta}</div>
    </div>
  )
}
