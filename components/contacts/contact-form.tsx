'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { createContact, updateContact } from '@/lib/actions/contacts'
import type { Contact, ContactStatus } from '@/lib/types'
import { PROPERTY_TYPES } from '@/lib/types'
import { useToast } from '../toast-provider'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  background: '#1A1A1A',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: '#F5F5F5',
  fontSize: 13.5,
  outline: 'none',
}

function FormInput(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = 'rgba(250,197,28,0.5)')}
      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  )
}

function FormSelect({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...p}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = 'rgba(250,197,28,0.5)')}
      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    >
      {children}
    </select>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: 'rgba(245,245,245,0.5)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

interface Props {
  contact?: Contact
  onClose: () => void
  onSaved: () => void
}

const AGENTS = ['Patricia Lara', 'Hugo Méndez', 'Camila Soto']
const SOURCES = ['Referido', 'Web', 'Instagram', 'Portal', 'Evento', 'Otro']

export default function ContactForm({ contact, onClose, onSaved }: Props) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: contact?.name ?? '',
    email: contact?.email ?? '',
    phone: contact?.phone ?? '',
    estado: (contact?.estado ?? 'lead') as ContactStatus,
    interes: contact?.interes ?? '',
    valor: contact?.valor ? String(contact.valor) : '',
    agente: contact?.agente ?? '',
    fuente: contact?.fuente ?? '',
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast('El nombre es obligatorio'); return }
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        estado: form.estado,
        interes: form.interes || null,
        valor: Number(form.valor) || 0,
        agente: form.agente || null,
        fuente: form.fuente || null,
        recency: 10,
        ultima: 'Nuevo',
        company_id: null,
      }
      if (contact) {
        await updateContact(contact.id, payload)
        toast('Contacto actualizado ✓')
      } else {
        await createContact(payload)
        toast('Contacto creado ✓')
      }
      onSaved()
    } catch {
      toast('Error al guardar contacto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-[540px] max-w-full max-h-[90vh] overflow-y-auto rounded-[18px] animate-fadeUp"
        style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between px-[26px] py-[22px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-[17px] font-semibold">{contact ? 'Editar contacto' : 'Nuevo contacto'}</h2>
          <button onClick={onClose} className="p-1 hover:text-white transition-colors" style={{ color: 'rgba(245,245,245,0.5)' }}>
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-[26px] grid grid-cols-2 gap-[18px]">
            <div className="col-span-2">
              <Field label="Nombre *">
                <FormInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Mariana Vega" required />
              </Field>
            </div>
            <Field label="Email">
              <FormInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="mariana@gmail.com" />
            </Field>
            <Field label="Teléfono">
              <FormInput value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+52 33 1234 5678" />
            </Field>
            <Field label="Estado">
              <FormSelect value={form.estado} onChange={(e) => set('estado', e.target.value as ContactStatus)}>
                <option value="lead">Lead</option>
                <option value="prospect">Prospecto</option>
                <option value="customer">Cliente</option>
              </FormSelect>
            </Field>
            <Field label="Valor potencial (USD)">
              <FormInput type="number" value={form.valor} onChange={(e) => set('valor', e.target.value)} placeholder="850000" />
            </Field>
            <Field label="Tipo de lote de interés">
              <FormSelect value={form.interes} onChange={(e) => {
                const pt = PROPERTY_TYPES.find((p) => p.name === e.target.value)
                set('interes', e.target.value)
                if (pt && !form.valor) set('valor', String(pt.price))
              }}>
                <option value="">Sin especificar</option>
                {PROPERTY_TYPES.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </FormSelect>
            </Field>
            <Field label="Agente">
              <FormSelect value={form.agente} onChange={(e) => set('agente', e.target.value)}>
                <option value="">Sin asignar</option>
                {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </FormSelect>
            </Field>
            <Field label="Fuente">
              <FormSelect value={form.fuente} onChange={(e) => set('fuente', e.target.value)}>
                <option value="">Desconocida</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </FormSelect>
            </Field>
          </div>

          <div className="flex justify-end gap-[11px] px-[26px] py-[18px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button" onClick={onClose}
              className="px-5 py-[11px] rounded-[10px] text-sm font-medium hover:bg-white/[0.04] transition-colors"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#F5F5F5' }}
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="px-[22px] py-[11px] rounded-[10px] text-sm font-semibold text-bg disabled:opacity-60 transition-colors"
              style={{ background: '#FAC51C' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = '#FFD23F') }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = '#FAC51C') }}
            >
              {loading ? 'Guardando...' : contact ? 'Guardar cambios' : 'Crear contacto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
