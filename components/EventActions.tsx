'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface EventActionsProps {
  eventId: string
  eventTitle: string
}

export default function EventActions({ eventId, eventTitle }: EventActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    router.push(`/painel/admin/eventos/${eventId}/editar`)
  }

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o evento "${eventTitle}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/eventos/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir evento')
      }

      router.refresh()
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      alert('Erro ao excluir evento. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={handleEdit}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
      >
        ✏️ Editar
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? '🗑️ Excluindo...' : '🗑️ Excluir'}
      </button>
    </>
  )
}
