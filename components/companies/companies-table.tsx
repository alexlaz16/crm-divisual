'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Globe, Mail, Phone, Plus, Trash2, X } from 'lucide-react'
import { createCompany, deleteCompany } from '@/lib/actions/companies'
import type { Company } from '@/lib/types'
import { useToast } from '../toast-provider'

const inputStyle = {
  width: '100%', padding: '11px 13px', background: '#1A1A1A',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F5F5F5', fontSize: 13.5, outline: 'none',
}
const F = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} style={inputStyle}
    onFocus={(e) => (e.target.style.borderColor = 'rgba(250,197,28,0.5)')}
    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
)

interface Props { companies: Company[] }

export default function CompaniesTable({ companies }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', industry: '', website: '', email: '', phone: '' })

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast('El nombre es obligatorio'); return }
    setLoading(true)
    try {
      await createCompany({ name: form.name, industry: form.industry || null, website: form.website || null, email: form.email || null, phone: form.phone || null })
      toast('Empresa creada ✓')
      setShowForm(false)
      setForm({ name: '', industry: '', website: '', email: '', phone: '' })
      router.refresh()
    } catch { toast('Error al crear empresa') }
    finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta empresa?')) return
    try {
      await deleteCompany(id)
      toast('Empresa eliminada')
      router.refresh()
    } catch { toast('Error al eliminar empresa') }
  }

  return (
    <>
      <div className="h-full overflow-y-auto px-11 py-[34px] pb-12">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Empresas</h1>
            <p className="text-[13.5px] mt-[6px]" style={{ color: 'rgba(245,245,245,0.45)' }}>{companies.length} empresas registradas</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-[10px] rounded-[10px] text-sm font-semibold text-bg"
            style={{ background: '#FAC51C' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFD23F')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FAC51C')}
          >
            <Plus size={16} /> Nueva empresa
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {companies.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl p-5 flex flex-col gap-3 group"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Building2 size={18} style={{ color: '#FAC51C' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    {c.industry && <div className="text-xs" style={{ color: 'rgba(245,245,245,0.4)' }}>{c.industry}</div>}
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all" style={{ color: 'rgba(239,68,68,0.7)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-[6px]">
                {c.website && <a href={c.website} target="_blank" rel="noopener" className="flex items-center gap-2 text-xs hover:text-white transition-colors" style={{ color: 'rgba(245,245,245,0.5)' }}><Globe size={12} />{c.website}</a>}
                {c.email && <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,245,245,0.5)' }}><Mail size={12} />{c.email}</div>}
                {c.phone && <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,245,245,0.5)' }}><Phone size={12} />{c.phone}</div>}
              </div>
            </div>
          ))}
          {companies.length === 0 && (
            <div className="col-span-3 py-16 text-center text-sm" style={{ color: 'rgba(245,245,245,0.35)' }}>
              No hay empresas. Crea la primera.
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(3px)' }} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-[480px] max-w-full rounded-[18px] animate-fadeUp" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <div className="flex items-center justify-between px-[26px] py-[22px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-[17px] font-semibold">Nueva empresa</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:text-white" style={{ color: 'rgba(245,245,245,0.5)' }}><X size={20} strokeWidth={1.6} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-[26px] grid grid-cols-2 gap-[18px]">
                {[
                  { label: 'Nombre *', key: 'name', placeholder: 'Inmobiliaria Laguna', col2: true },
                  { label: 'Industria', key: 'industry', placeholder: 'Real Estate' },
                  { label: 'Sitio web', key: 'website', placeholder: 'https://laguna.mx' },
                  { label: 'Email', key: 'email', placeholder: 'info@laguna.mx' },
                  { label: 'Teléfono', key: 'phone', placeholder: '+52 33 1234 5678' },
                ].map((field) => (
                  <div key={field.key} className={field.col2 ? 'col-span-2' : ''}>
                    <label className="block text-[11px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: 'rgba(245,245,245,0.5)' }}>{field.label}</label>
                    <F value={(form as Record<string,string>)[field.key]} onChange={(e) => set(field.key as keyof typeof form, e.target.value)} placeholder={field.placeholder} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-[11px] px-[26px] py-[18px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-[11px] rounded-[10px] text-sm font-medium hover:bg-white/[0.04]" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#F5F5F5' }}>Cancelar</button>
                <button type="submit" disabled={loading} className="px-[22px] py-[11px] rounded-[10px] text-sm font-semibold text-bg disabled:opacity-60" style={{ background: '#FAC51C' }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = '#FFD23F') }}
                  onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = '#FAC51C') }}>
                  {loading ? 'Creando...' : 'Crear empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
