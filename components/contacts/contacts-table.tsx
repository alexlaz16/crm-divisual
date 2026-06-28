'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { fmt, initials, statusMeta } from '@/lib/utils'
import StatusBadge from './status-badge'
import ContactForm from './contact-form'
import type { Contact, ContactStatus } from '@/lib/types'
import { useToast } from '../toast-provider'

type SortKey = 'name' | 'estado' | 'interes' | 'valor' | 'agente' | 'ultima'

const CHIPS: { key: ContactStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'lead', label: 'Leads' },
  { key: 'prospect', label: 'Prospectos' },
  { key: 'customer', label: 'Clientes' },
]

const ORDER: Record<ContactStatus, number> = { lead: 0, prospect: 1, customer: 2 }

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ContactStatus | 'all'>('all')
  const [sortCol, setSortCol] = useState<SortKey>('valor')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showForm, setShowForm] = useState(false)

  const counts = {
    all: contacts.length,
    lead: contacts.filter((c) => c.estado === 'lead').length,
    prospect: contacts.filter((c) => c.estado === 'prospect').length,
    customer: contacts.filter((c) => c.estado === 'customer').length,
  }

  function toggleSort(key: SortKey) {
    if (sortCol === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(key); setSortDir(key === 'name' ? 'asc' : 'desc') }
  }

  let list = contacts.slice()
  if (filter !== 'all') list = list.filter((c) => c.estado === filter)
  if (search.trim()) {
    const q = search.toLowerCase()
    list = list.filter((c) =>
      [c.name, c.email, c.interes, c.agente].filter(Boolean).join(' ').toLowerCase().includes(q),
    )
  }
  const dir = sortDir === 'asc' ? 1 : -1
  list.sort((a, b) => {
    let av: number | string, bv: number | string
    if (sortCol === 'valor') { av = a.valor; bv = b.valor }
    else if (sortCol === 'ultima') { av = a.recency; bv = b.recency }
    else if (sortCol === 'estado') { av = ORDER[a.estado]; bv = ORDER[b.estado] }
    else {
      const key = sortCol as keyof Contact
      av = String(a[key] ?? '').toLowerCase()
      bv = String(b[key] ?? '').toLowerCase()
    }
    return av < bv ? -1 * dir : av > bv ? 1 * dir : 0
  })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortCol !== col) return <ChevronsUpDown size={12} className="opacity-40" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ color: '#FAC51C' }} />
      : <ChevronDown size={12} style={{ color: '#FAC51C' }} />
  }

  function Th({ col, label, right = false }: { col: SortKey; label: string; right?: boolean }) {
    const active = sortCol === col
    return (
      <div
        onClick={() => toggleSort(col)}
        className={`flex items-center gap-[5px] cursor-pointer select-none text-[10.5px] uppercase tracking-[0.1em] font-semibold ${right ? 'justify-end' : ''}`}
        style={{ color: active ? '#FAC51C' : 'rgba(245,245,245,0.45)' }}
      >
        {label} <SortIcon col={col} />
      </div>
    )
  }

  return (
    <>
      <div className="h-full overflow-y-auto px-11 py-[34px] pb-12">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Contactos</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-[10px] rounded-[10px] text-sm font-semibold text-bg"
            style={{ background: '#FAC51C' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFD23F')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FAC51C')}
          >
            + Nuevo contacto
          </button>
        </div>
        <p className="text-[13.5px] mb-6" style={{ color: 'rgba(245,245,245,0.45)' }}>
          {counts.all} contactos · {counts.customer} clientes · {counts.prospect} prospectos
        </p>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-[18px] flex-wrap">
          <div className="relative w-[340px] max-w-[46vw]">
            <Search size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(245,245,245,0.4)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, interés..."
              className="w-full pl-10 pr-4 py-[11px] rounded-[10px] text-[13.5px] text-white outline-none"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(250,197,28,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CHIPS.map((ch) => {
              const active = filter === ch.key
              return (
                <button
                  key={ch.key}
                  onClick={() => setFilter(ch.key)}
                  className="flex items-center gap-[7px] px-[15px] py-[9px] rounded-full text-[13px] font-medium transition-colors"
                  style={{
                    background: active ? '#FAC51C' : 'transparent',
                    border: `1px solid ${active ? '#FAC51C' : 'rgba(255,255,255,0.12)'}`,
                    color: active ? '#080808' : 'rgba(245,245,245,0.7)',
                  }}
                >
                  {ch.label}
                  <span className="opacity-55 text-xs tabular-nums">{counts[ch.key]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="grid gap-3 px-[18px] py-[14px]"
            style={{ gridTemplateColumns: 'minmax(200px,1.8fr) 130px 1.3fr 120px 1.2fr 110px', background: 'rgba(255,255,255,0.015)' }}
          >
            <Th col="name" label="Nombre" />
            <Th col="estado" label="Estado" />
            <Th col="interes" label="Interés" />
            <Th col="valor" label="Valor" right />
            <Th col="agente" label="Agente" />
            <Th col="ultima" label="Actividad" right />
          </div>

          {list.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/contacts/${c.id}`)}
              className="grid items-center gap-3 px-[18px] py-[13px] cursor-pointer transition-colors hover:bg-white/[0.025]"
              style={{ gridTemplateColumns: 'minmax(200px,1.8fr) 130px 1.3fr 120px 1.2fr 110px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-[38px] h-[38px] rounded-full flex-shrink-0 flex items-center justify-center text-[12.5px] font-semibold"
                  style={{
                    background: '#1A1A1A',
                    border: `1px solid ${c.estado === 'customer' ? 'rgba(250,197,28,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: 'rgba(245,245,245,0.85)',
                  }}
                >
                  {initials(c.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{c.name}</div>
                  <div className="text-[11.5px] truncate" style={{ color: 'rgba(245,245,245,0.4)' }}>{c.email}</div>
                </div>
              </div>
              <StatusBadge status={c.estado} />
              <div className="text-sm truncate" style={{ color: 'rgba(245,245,245,0.6)' }}>{c.interes}</div>
              <div className="text-[13.5px] font-semibold text-right tabular-nums">{fmt(c.valor)}</div>
              <div className="text-[12.5px] truncate" style={{ color: 'rgba(245,245,245,0.6)' }}>{c.agente}</div>
              <div className="text-[12.5px] text-right" style={{ color: 'rgba(245,245,245,0.45)' }}>{c.ultima}</div>
            </div>
          ))}

          {list.length === 0 && (
            <div className="py-12 text-center text-[13.5px]" style={{ color: 'rgba(245,245,245,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              Sin resultados para tu búsqueda.
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ContactForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); router.refresh() }}
        />
      )}
    </>
  )
}
