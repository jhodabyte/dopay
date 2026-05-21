import { Suspense } from 'react'
import { mockProfile } from '@/lib/mock-data'
import { getProperties } from './data'
import PropertiesClient from './PropertiesClient'
import PropertiesTopbar from './PropertiesTopbar'
import Spinner from '@/components/ui/Spinner'

export default async function PropiedadesPage() {
  const ownerId = mockProfile.id
  const properties = await getProperties(ownerId)
  const activeCount = properties.filter((p) => p.status === 'active').length

  return (
    <>
      <PropertiesTopbar activeCount={activeCount} />
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      }>
        <PropertiesClient properties={properties} />
      </Suspense>
    </>
  )
}
