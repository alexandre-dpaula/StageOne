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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir evento')
      }

      alert('Evento excluído com sucesso!')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao excluir evento:', error)
      alert(error.message || 'Erro ao excluir evento. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={handleEdit}
        className="px-4 py-2 bg-card hover:bg-card-hover text-foreground rounded-lg text-sm transition-colors"
      >
        Editar
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-card hover:bg-red-600/20 text-red-500 hover:text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Excluindo...' : 'Excluir'}
      </button>
    </>
  )
}
