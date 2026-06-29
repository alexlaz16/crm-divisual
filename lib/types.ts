export type ContactStatus = 'lead' | 'prospect' | 'customer'

export const PROPERTY_TYPES = [
  { name: 'Perimetral',                   price: 1100400 },
  { name: 'Perimetral Esquina',           price: 1142400 },
  { name: 'Regular',                      price: 1155000 },
  { name: 'Regular Esquina',              price: 1197000 },
  { name: 'Preferencial',                 price: 1260000 },
  { name: 'Preferencial Esquina',         price: 1302000 },
  { name: 'Preferencial Premium',         price: 1365000 },
  { name: 'Preferencial Premium Esquina', price: 1407000 },
  { name: 'Comercial',                    price: 2830080 },
  { name: 'Comercial Esquina',            price: 3113088 },
] as const
export type ActivityType = 'nota' | 'llamada' | 'email' | 'visita' | 'propuesta' | 'movimiento'

export const STAGES = [
  'Nuevo Lead',
  'Calificado',
  'Visita Agendada',
  'Propuesta',
  'Negociación',
  'Cerrado',
] as const
export type Stage = (typeof STAGES)[number]

export interface Contact {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  estado: ContactStatus
  interes: string | null
  valor: number
  agente: string | null
  fuente: string | null
  recency: number
  ultima: string | null
  company_id: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  user_id: string
  name: string
  industry: string | null
  website: string | null
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  user_id: string
  cliente: string
  propiedad: string | null
  valor: number
  etapa: Stage
  prob: number
  agente: string | null
  contact_id: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  contact_id: string | null
  deal_id: string | null
  title: string
  description: string | null
  type: ActivityType
  gold: boolean
  created_at: string
}

export interface KpiData {
  label: string
  value: string
  delta: string
  sparkData: number[]
}
