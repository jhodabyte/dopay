import { notFound } from 'next/navigation'
import DetailTopbar from './DetailTopbar'
import { mockProfile } from '@/lib/mock-data'
import { getPropertyDetail } from './data'
import PropertyDetailClient from './PropertyDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage(props: PageProps) {
  const params = await props.params
  const ownerId = mockProfile.id
  const detail = await getPropertyDetail(params.id, ownerId)

  if (!detail) {
    notFound()
  }

  const { property, tenant, payments } = detail

  const subtitle =
    property.status === 'active'
      ? 'Propiedad activa · Contrato vigente'
      : property.status === 'overdue'
      ? 'Propiedad en mora'
      : 'Propiedad desocupada'

  return (
    <>
      <DetailTopbar title={property.name} subtitle={subtitle} />
      <PropertyDetailClient property={property} tenant={tenant} payments={payments} />
    </>
  )
}
