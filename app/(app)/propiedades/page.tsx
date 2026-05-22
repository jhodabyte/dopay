import { Suspense } from 'react'
import { getProperties } from './data'
import PropertiesClient from './PropertiesClient'
import Spinner from '@/components/ui/Spinner'

export default async function PropiedadesPage() {
  const properties = await getProperties()

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    }>
      <PropertiesClient properties={properties} />
    </Suspense>
  )
}
