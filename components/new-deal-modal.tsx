'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createDeal } from '@/lib/actions/deals'
import { getContacts } from '@/lib/actions/contacts'
import { STAGES, PROPERTY_TYPES } from '@/lib/types'
import type { Contact } from '@/lib/types'
import { useToast } from './toast-provider'

interface Props {
  open: boolean
  onClose: () => void
}

const AGENTS = ['Patricia Lara', 'Hugo Méndez', 'Camila Soto']

const inputStyle = {
  width: '100%',
  padding: '11px 13px',
  background: '#1A1A1A',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: '#F5F5F5',
  fontSize: 13.5,
  outline: 'none',
}

function ModalInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={inputStyle}
      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(250,197,28,0.5)' }}
      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
    />
  )
}

function ModalSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={inputStyle}
      onFocus={(e) => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(250,197,28,0.5)' }}
      onBlur={(e) => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
    >
      {children}
    </select>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11.5px] uppercase tracking-[0.08em] font-semibold mb-2" style={{ color: 'rgba(245,245,245,0.5)' }}>
      {children}
    </label>
  )
}

export default function NewDealModal({ open, onClose }: Props) {
  const toast = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    cliente: '',
    propiedad: '',
    valor: '',
    etapa: 'Nuevo Lead',
    prob: 50,
    agente: '',
    cierre: '',
    notas: '',
  })

  useEffect(() => {
    if (open) {
      getContacts().then(setContacts).catch(() => {})
    }
  }, [open])

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handlePropertyChange(name: string) {
    const pt = PROPERTY_TYPES.find((p) => p.name === name)
    setForm((f) => ({
      ...f,
      propiedad: name,
      valor: pt ? String(pt.price) : f.valor,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.cliente || !form.propiedad) {
      toast('Completa cliente y tipo de lote')
      return
    }
    setLoading(true)
    try {
      await createDeal({
        cliente: form.cliente,
        propiedad: form.propiedad,
        valor: Number(form.valor) || 0,
        etapa: form.etapa as (typeof STAGES)[number],
        prob: Number(form.prob),
        agente: form.agente || null,
        contact_id: contacts.find((c) => c.name === form.cliente)?.id ?? null,
        position: 0,
      })
      toast('Deal creado en el pipeline ✓')
      onClose()
      setForm({ cliente: '', propiedad: '', valor: '', etapa: 'Nuevo Lead', prob: 50, agente: '', cierre: '', notas: '' })
    } catch {
      toast('Error al crear deal')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-[600px] max-w-full max-h-[90vh] overflow-y-auto rounded-[18px] animate-fadeUp"
        style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[26px] py-[22px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-[17px] font-semibold">Nuevo Deal</h2>
          <button onClick={onClose} className="p-1 rounded transition-colors hover:text-white" style={{ color: 'rgba(245,245,245,0.5)' }}>
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-[26px] grid grid-cols-2 gap-[18px]">
            <div>
              <Label>Cliente *</Label>
              <ModalSelect value={form.cliente} onChange={(e) => set('cliente', e.target.value)}>
                <option value="">Selecciona contacto...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </ModalSelect>
            </div>
            <div>
              <Label>Tipo de lote *</Label>
              <ModalSelect value={form.propiedad} onChange={(e) => handlePropertyChange(e.target.value)}>
                <option value="">Selecciona tipo...</option>
                {PROPERTY_TYPES.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </ModalSelect>
            </div>
            <div>
              <Label>Valor (USD)</Label>
              <ModalInput
                type="number"
                value={form.valor}
                onChange={(e) => set('valor', e.target.value)}
                placeholder="Se auto-llena al elegir lote"
              />
            </div>
            <div>
              <Label>Agente</Label>
              <ModalSelect value={form.agente} onChange={(e) => set('agente', e.target.value)}>
                <option value="">Sin asignar</option>
                {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </ModalSelect>
            </div>
            <div>
              <Label>Etapa</Label>
              <ModalSelect value={form.etapa} onChange={(e) => set('etapa', e.target.value)}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </ModalSelect>
            </div>
            <div>
              <Label>Fecha de cierre</Label>
              <ModalInput type="date" value={form.cierre} onChange={(e) => set('cierre', e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' } as React.CSSProperties} />
            </div>
            <div className="col-span-2">
              <label className="flex justify-between text-[11.5px] uppercase tracking-[0.08em] font-semibold mb-[10px]" style={{ color: 'rgba(245,245,245,0.5)' }}>
                <span>Probabilidad</span>
                <span style={{ color: '#FAC51C' }}>{form.prob}%</span>
              </label>
              <input
                type="range" min={0} max={100} step={5}
                value={form.prob}
                onChange={(e) => set('prob', Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="col-span-2">
              <Label>Notas</Label>
              <textarea
                value={form.notas}
                onChange={(e) => set('notas', e.target.value)}
                placeholder="Detalles del deal, preferencias del cliente..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(250,197,28,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-[11px] px-[26px] py-[18px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-[11px] rounded-[10px] text-sm font-medium transition-colors hover:bg-white/[0.04]"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#F5F5F5' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-[22px] py-[11px] rounded-[10px] text-sm font-semibold text-bg transition-colors disabled:opacity-60"
              style={{ background: '#FAC51C' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = '#FFD23F') }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = '#FAC51C') }}
            >
              {loading ? 'Creando...' : 'Crear Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
