'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OFFICIAL_LOCATION } from '@/lib/constants/location'

const createTempId = () => `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const formatSessionName = (index: number, baseTitle: string) => {
  const sessionNumber = String(index + 1).padStart(2, '0')
  const trimmedTitle = baseTitle?.trim()
  return trimmedTitle ? `Sessão ${sessionNumber} - ${trimmedTitle}` : `Sessão ${sessionNumber}`
}

interface Module {
  id: string
  title: string
  hours: number
}

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  autoName: boolean
}

interface Event {
  id: string
  title: string
  subtitle: string
  description: string
  slug: string
  category: string
  cover_image: string | null
  start_datetime: string
  capacity: number
  location_name: string
  address: string
  city: string
  state: string
  is_published: boolean
  modules: any[]
  ticketTypes: any[]
}

interface EventEditFormProps {
  event: Event
  backUrl: string
}

export default function EventEditForm({ event, backUrl }: EventEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Event fields
  const [title, setTitle] = useState(event.title)
  const [subtitle, setSubtitle] = useState(event.subtitle)
  const [description, setDescription] = useState(event.description)
  const [category, setCategory] = useState(event.category)
  const [thumbnailUrl, setThumbnailUrl] = useState(event.cover_image || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(event.cover_image)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [capacity, setCapacity] = useState(event.capacity.toString())
  const [locationName, setLocationName] = useState(event.location_name || OFFICIAL_LOCATION.name)
  const [address, setAddress] = useState(event.address || OFFICIAL_LOCATION.address)
  const [city, setCity] = useState(event.city || OFFICIAL_LOCATION.city)
  const [state, setState] = useState(event.state || OFFICIAL_LOCATION.state)
  const [isPublished, setIsPublished] = useState(event.is_published)

  // Extract date and time from datetime
  const datetime = new Date(event.start_datetime)
  const [startDate, setStartDate] = useState(
    datetime.toISOString().split('T')[0]
  )
  const [startTime, setStartTime] = useState(
    datetime.toTimeString().slice(0, 5)
  )

  // Modules
  const [modules, setModules] = useState<Module[]>(
    event.modules.length > 0
      ? event.modules.map((m) => ({
          id: m.id,
          title: m.title,
          hours: m.hours,
        }))
      : [{ id: createTempId(), title: '', hours: 0 }]
  )

  // Ticket Types
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(
    event.ticketTypes.length > 0
      ? event.ticketTypes.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          price: t.price,
          quantity: t.total_quantity,
          autoName: false,
        }))
      : [
          {
            id: createTempId(),
            name: formatSessionName(0, event.title),
            description: '',
            price: 0,
            quantity: 0,
            autoName: true,
          },
        ]
  )

  const categories = [
    'TECNOLOGIA',
    'LIDERANÇA',
    'VENDAS',
    'MARKETING',
    'GESTÃO',
    'DESENVOLVIMENTO PESSOAL',
    'SAÚDE',
    'EDUCAÇÃO',
  ]

  const addModule = () => {
    setModules([...modules, { id: createTempId(), title: '', hours: 0 }])
  }

  const removeModule = (id: string) => {
    if (modules.length > 1) {
      setModules(modules.filter((m) => m.id !== id))
    }
  }

  const updateModule = (id: string, field: 'title' | 'hours', value: string | number) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  useEffect(() => {
    setTicketTypes((prev) =>
      prev.map((ticket, index) =>
        ticket.autoName ? { ...ticket, name: formatSessionName(index, title) } : ticket
      )
    )
  }, [title])

  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      {
        id: createTempId(),
        name: formatSessionName(prev.length, title),
        description: '',
        price: 0,
        quantity: 0,
        autoName: true,
      },
    ])
  }

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes((prev) =>
        prev
          .filter((t) => t.id !== id)
          .map((ticket, index) =>
            ticket.autoName ? { ...ticket, name: formatSessionName(index, title) } : ticket
          )
      )
    }
  }

  const updateTicketType = (id: string, field: keyof TicketType, value: string | number) => {
    setTicketTypes((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        if (field === 'name') {
          return { ...t, name: value as string, autoName: false }
        }
        return { ...t, [field]: value }
      })
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho (1MB)
    if (file.size > 1048576) {
      alert('A imagem deve ter no máximo 1MB')
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setImageFile(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `event-covers/${fileName}`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', filePath)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao fazer upload da imagem')
    }

    const data = await response.json()
    return data.url
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!title || !subtitle || !description || !startDate || !startTime) {
        throw new Error('Preencha todos os campos obrigatórios')
      }

      if (!capacity || parseInt(capacity) <= 0) {
        throw new Error('Capacidade deve ser maior que zero')
      }

      // Validate modules
      const validModules = modules.filter((m) => m.title && m.hours > 0)
      if (validModules.length === 0) {
        throw new Error('Adicione pelo menos um módulo válido')
      }

      // Validate ticket types
      const validTickets = ticketTypes.filter((t) => t.name && t.price >= 0 && t.quantity > 0)
      if (validTickets.length === 0) {
        throw new Error('Adicione pelo menos um tipo de ingresso válido')
      }

      // Upload da imagem se houver um novo arquivo
      let coverImageUrl = thumbnailUrl
      if (imageFile) {
        setUploadingImage(true)
        try {
          coverImageUrl = await uploadImage(imageFile)
        } catch (err: any) {
          throw new Error(err.message || 'Erro ao fazer upload da imagem')
        } finally {
          setUploadingImage(false)
        }
      }

      // Generate slug
      const slug = generateSlug(title)

      // Combine date and time
      const datetime = `${startDate}T${startTime}:00`

      // Create event data
      const eventData = {
        title,
        subtitle,
        description,
        slug,
        category,
        cover_image: coverImageUrl || null,
        start_datetime: datetime,
        capacity: parseInt(capacity),
        location_name: locationName,
        address,
        city,
        state,
        is_published: isPublished,
        modules: validModules.map((m, index) => ({
          id: m.id.startsWith('new-') ? undefined : m.id,
          title: m.title,
          hours: m.hours,
          order_index: index,
        })),
        ticket_types: validTickets.map((t) => ({
          id: t.id.startsWith('new-') ? undefined : t.id,
          name: t.name,
          description: t.description,
          price: parseFloat(t.price.toString()),
          total_quantity: parseInt(t.quantity.toString()),
          is_active: true,
        })),
      }

      // Call API to update event
      const response = await fetch(`/api/eventos/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar evento')
      }

      // Redirect back
      router.push(backUrl)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar evento')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Editar <span className="text-primary text-glow">Evento</span>
        </h1>
        <p className="text-placeholder">Atualize as informações do evento</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 animate-fade-in">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="glass rounded-2xl p-6 border border-border/30 animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground mb-4">Informações Básicas</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-foreground text-sm mb-2">Título do Evento *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Workshop de Liderança 2025"
                required
              />
            </div>

            <div>
              <label className="block text-foreground text-sm mb-2">Subtítulo *</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Desenvolva suas habilidades de gestão"
                required
              />
            </div>

            <div>
              <label className="block text-foreground text-sm mb-2">Descrição *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Descrição completa do evento..."
                required
              />
            </div>

            <div>
              <label className="block text-foreground text-sm mb-2">Categoria *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-foreground text-sm mb-2">
                Imagem do Evento
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-background hover:file:opacity-90 file:cursor-pointer"
                />
              </div>
              {imagePreview && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                      setThumbnailUrl('')
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              )}
              <p className="text-xs text-placeholder mt-2">
                Formato: JPG, PNG ou WebP | Tamanho máximo: 1MB | Dimensões recomendadas: 1024x768px
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground text-sm mb-2">Data *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-foreground text-sm mb-2">Horário *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground text-sm mb-2">Capacidade (vagas) *</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: 100"
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">Localização</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-foreground text-sm mb-2">Nome do Local</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Centro de Convenções"
              />
            </div>

            <div>
              <label className="block text-foreground text-sm mb-2">Endereço</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Rua das Flores, 123"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground text-sm mb-2">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: São Paulo"
                />
              </div>

              <div>
                <label className="block text-foreground text-sm mb-2">Estado</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Módulos */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Módulos do Evento *</h2>
            <button
              type="button"
              onClick={addModule}
              className="btn-primary text-sm"
            >
              + Adicionar Módulo
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={module.id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-placeholder text-sm">Módulo {index + 1}</span>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(module.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                      className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Título do módulo"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      value={module.hours || ''}
                      onChange={(e) =>
                        updateModule(module.id, 'hours', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Horas"
                      min="0"
                      step="0.5"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sessões */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Sessões do Evento *</h2>
              <p className="text-sm text-placeholder mt-1">
                Utilize uma sessão por turma/data com a quantidade de vagas correspondente.
              </p>
            </div>
            <button
              type="button"
              onClick={addTicketType}
              className="btn-primary text-sm"
            >
              + Adicionar Sessão
            </button>
          </div>

          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={ticket.id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-placeholder text-sm">Sessão {index + 1}</span>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketType(ticket.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                    className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Sessão 02 - 03/02 às 18h - Para 80 pessoas"
                    required
                  />

                  <input
                    type="text"
                    value={ticket.description}
                    onChange={(e) => updateTicketType(ticket.id, 'description', e.target.value)}
                    className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Descrição (opcional)"
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-placeholder text-xs mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        value={ticket.price || ''}
                        onChange={(e) =>
                          updateTicketType(ticket.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-placeholder text-xs mb-1">Vagas (Quantidade)</label>
                      <input
                        type="number"
                        value={ticket.quantity || ''}
                        onChange={(e) =>
                          updateTicketType(ticket.id, 'quantity', parseInt(e.target.value) || 0)
                        }
                        className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publicação */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">Publicação</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5 rounded bg-card border-border text-primary focus:ring-primary"
            />
            <span className="text-foreground">
              Publicar evento (visível para todos)
            </span>
          </label>
          <p className="text-gray-500 text-sm mt-2 ml-8">
            Se desmarcado, o evento será salvo como rascunho
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="btn-primary flex-1 text-lg disabled:bg-card-hover disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {uploadingImage ? 'Enviando imagem...' : loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>

          <Link
            href={backUrl}
            className="px-6 py-4 glass border border-border/30 hover:border-primary/50 text-foreground rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
