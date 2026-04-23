'use client'

import { useParams } from 'next/navigation'
import { ProjetoEditor } from '../_components/ProjetoEditor'

export default function ProjetoEditPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) return null

  return <ProjetoEditor mode="edit" projectId={id} />
}
