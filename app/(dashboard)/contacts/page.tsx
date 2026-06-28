import { getContacts } from '@/lib/actions/contacts'
import ContactsTable from '@/components/contacts/contacts-table'

export const dynamic = 'force-dynamic'

export default async function ContactsPage() {
  const contacts = await getContacts()
  return <ContactsTable contacts={contacts} />
}
