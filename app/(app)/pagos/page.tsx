import { Suspense } from 'react'
import Spinner from '@/components/ui/Spinner'
import PagosClient from './PagosClient'
import { getPaymentsData, getPaymentsSummary } from './data'
import { getProperties } from '../propiedades/data'

export default async function PagosPage() {
  const [{ payments }, summary, propertiesWithTenant] = await Promise.all([
    getPaymentsData(),
    getPaymentsSummary(),
    getProperties(),
  ])

  const properties = propertiesWithTenant.map(({ tenant: _tenant, ...rest }) => rest)

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner />
      </div>
    }>
      <PagosClient payments={payments} summary={summary} properties={properties} />
    </Suspense>
  )
}
