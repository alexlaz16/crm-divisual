'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Phone, Mail, Calendar, Edit2, Trash2 } from 'lucide-react'
import { getContact, deleteContact } from '@/lib/actions/contacts'
import { getActivities } from '@/lib/actions/activities'
import ActivityTimeline from '@/components/activities/timeline'
import StatusBadge from '@/components/contacts/status-badge'
import ContactForm from '@/components/contacts/contact-form'
import { fmtFull, initials } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'
import { useRole } from '@/components/role-provider'
import type { Contact, Activity } from '@/lib/types'

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const toast = useToast()
  const role = useRole()
  const [contact, setContact] = useState<Contact | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [showEdit, setShowEdit] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function load() {
    try {
      const [c, acts] = await Promise.all([getContact(id), getActivities(id)])
      setContact(c)
      setActivities(acts)
    } catch {
      router.push('/contacts')
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete() {
    if (!confirm('¿Eliminar este contacto? Esta acción no se puede deshacer.')) return
    setIsPending(true)
    try {
      await deleteContact(id)
      toast('Contacto eliminado')
      router.push('/contacts')
    } catch {
      toast('Error al eliminar contacto')
    } finally {
      setIsPending(false)
    }
  }

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: 'rgba(245,245,245,0.4)' }}>
        Cargando...
      </div>
    )
  }

  const prob = contact.estado === 'customer' ? 90 : contact.estado === 'prospect' ? 55 : 25

  return (
    <>
      <div className="h-full overflow-y-auto px-4 py-6 pb-8 sm:px-11 sm:py-7 sm:pb-12">
        {/* Back */}
        <button
          onClick={() => router.push('/contacts')}
          className="flex items-center gap-[7px] mb-[18px] text-sm transition-colors hover:text-white"
          style={{ background: 'none', border: 'none', color: 'rgba(245,245,245,0.55)', cursor: 'pointer', padding: '6px 0' }}
        >
          <ChevronLeft size={16} strokeWidth={1.6} />
          Contactos
        </button>

        {/* Header card */}
        <div className="rounded-2xl p-5 sm:p-[26px] mb-[18px]" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start gap-5 flex-wrap">
            <div
              className="w-[68px] h-[68px] rounded-full flex-shrink-0 flex items-center justify-center text-[22px] font-semibold"
              style={{ background: '#1A1A1A', border: `1.5px solid ${contact.estado === 'customer' ? '#FAC51C' : 'rgba(255,255,255,0.15)'}`, color: '#F5F5F5' }}
            >
              {initials(contact.name)}
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[23px] font-semibold tracking-[-0.01em]">{contact.name}</h1>
                <StatusBadge status={contact.estado} />
              </div>
              <p className="mt-[6px] text-[13.5px]" style={{ color: 'rgba(245,245,245,0.5)' }}>
                {contact.interes ? `Interesado/a en ${contact.interes}` : 'Sin propiedad de interés'}
              </p>
            </div>
            <div className="flex gap-[9px] flex-wrap">
              {[
                { Icon: Phone, label: 'Llamar' },
                { Icon: Mail, label: 'Email' },
                { Icon: Calendar, label: 'Agendar' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-[7px] px-[14px] py-[9px] rounded-[9px] text-[12.5px] font-medium transition-colors hover:border-accent/50"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#F5F5F5' }}
                >
                  <Icon size={15} strokeWidth={1.5} /> {label}
                </button>
              ))}
              {role === 'admin' && (
                <>
                  <button
                    onClick={() => setShowEdit(true)}
                    className="flex items-center gap-[7px] px-[14px] py-[9px] rounded-[9px] text-[12.5px] font-medium transition-colors hover:border-accent/50"
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#F5F5F5' }}
                  >
                    <Edit2 size={15} strokeWidth={1.5} /> Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex items-center gap-[7px] px-[14px] py-[9px] rounded-[9px] text-[12.5px] font-medium transition-colors"
                    style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                  >
                    <Trash2 size={15} strokeWidth={1.5} /> Eliminar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[18px] mt-6 pt-[22px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Email', value: contact.email },
              { label: 'Teléfono', value: contact.phone },
              { label: 'Agente', value: contact.agente },
              { label: 'Fuente', value: contact.fuente },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[10.5px] uppercase tracking-[0.1em] mb-[5px]" style={{ color: 'rgba(245,245,245,0.4)' }}>{label}</div>
                <div className="text-sm truncate">{value ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body: timeline + deal facts */}
        <div className="grid gap-[18px] items-start grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          <ActivityTimeline activities={activities} contactId={id} />

          <div className="flex flex-col gap-[18px]">
            <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-[15px] font-semibold mb-[18px]">Detalles del deal</h2>
              <div className="flex flex-col gap-[15px]">
                <div className="flex justify-between items-center">
                  <span className="text-[12.5px]" style={{ color: 'rgba(245,245,245,0.45)' }}>Propiedad de interés</span>
                  <span className="text-sm font-medium">{contact.interes ?? '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12.5px]" style={{ color: 'rgba(245,245,245,0.45)' }}>Valor potencial</span>
                  <span className="text-[15px] font-semibold tabular-nums" style={{ color: '#FAC51C' }}>{fmtFull(contact.valor)}</span>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[12.5px]" style={{ color: 'rgba(245,245,245,0.45)' }}>Probabilidad de cierre</span>
                    <span className="text-[12.5px] font-semibold">{prob}%</span>
                  </div>
                  <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: `${prob}%`, background: 'linear-gradient(90deg,rgba(250,197,28,0.45),#FAC51C)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEdit && role === 'admin' && (
        <ContactForm
          contact={contact}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); load() }}
        />
      )}
    </>
  )
}
