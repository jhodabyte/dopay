'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import NewPropertyModal from '@/components/properties/NewPropertyModal'
import { useRouter } from 'next/navigation'

interface PropertiesTopbarProps {
  activeCount: number
}

export default function PropertiesTopbar({ activeCount }: PropertiesTopbarProps) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  return (
    <>
      <Topbar
        title="Propiedades"
        subtitle={`Gestiona tus ${activeCount} inmueble${activeCount !== 1 ? 's' : ''} activo${activeCount !== 1 ? 's' : ''}`}
        ctaLabel="Nueva propiedad"
        onCtaClick={() => setShowModal(true)}
      />
      <NewPropertyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => { setShowModal(false); router.refresh() }}
      />
    </>
  )
}
