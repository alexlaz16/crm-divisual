import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ContactStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number): string {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M'
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K'
  return '$' + n
}

export function fmtFull(n: number): string {
  return '$' + Number(n).toLocaleString('es-MX')
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function sparkPoints(arr: number[]): string {
  const w = 104,
    h = 30,
    mx = Math.max(...arr),
    mn = Math.min(...arr),
    r = (mx - mn) || 1
  return arr
    .map(
      (v, i) =>
        ((i / (arr.length - 1)) * w).toFixed(1) +
        ',' +
        (h - ((v - mn) / r) * h + 2).toFixed(1),
    )
    .join(' ')
}

export function statusMeta(e: ContactStatus) {
  if (e === 'customer')
    return {
      label: 'Cliente',
      color: '#FAC51C',
      dot: '#FAC51C',
      bg: 'rgba(250,197,28,0.08)',
      border: 'rgba(250,197,28,0.28)',
    }
  if (e === 'prospect')
    return {
      label: 'Prospecto',
      color: '#F5F5F5',
      dot: '#F5F5F5',
      bg: 'rgba(245,245,245,0.06)',
      border: 'rgba(245,245,245,0.2)',
    }
  return {
    label: 'Lead',
    color: 'rgba(245,245,245,0.6)',
    dot: 'rgba(245,245,245,0.4)',
    bg: 'rgba(245,245,245,0.03)',
    border: 'rgba(245,245,245,0.12)',
  }
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Ayer'
  return `Hace ${d} días`
}
