import { notFound } from 'next/navigation'
import { getPropertyDetail } from './data'
import PropertyDetailClient from './PropertyDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage(props: PageProps) {
  const params = await props.params
  const detail = await getPropertyDetail(params.id)

  if (!detail) {
    notFound()
  }

  const { property, tenant, payments } = detail

  return (
    <PropertyDetailClient property={property} tenant={tenant} payments={payments} />
  )
}
