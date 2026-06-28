import { getCompanies } from '@/lib/actions/companies'
import CompaniesTable from '@/components/companies/companies-table'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const companies = await getCompanies()
  return <CompaniesTable companies={companies} />
}
