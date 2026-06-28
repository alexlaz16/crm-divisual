import { sparkPoints } from '@/lib/utils'

export default function Sparkline({ data }: { data: number[] }) {
  return (
    <svg
      viewBox="0 0 104 34"
      width={88}
      height={30}
      preserveAspectRatio="none"
      style={{ overflow: 'visible', flexShrink: 0 }}
    >
      <polyline
        points={sparkPoints(data)}
        fill="none"
        stroke="#FAC51C"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
