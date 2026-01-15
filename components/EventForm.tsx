'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { OFFICIAL_LOCATION } from '@/lib/constants/location'

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

const createTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const formatSessionName = (index: number, baseTitle: string) => {
  const sessionNumber = String(index + 1).padStart(2, '0')
  const trimmedTitle = baseTitle?.trim()
  return trimmedTitle ? `Sessão ${sessionNumber} - ${trimmedTitle}` : `Sessão ${sessionNumber}`
}

interface EventFormProps {
  backUrl: string
  redirectBase: string
}

export default function EventForm({ backUrl, redirectBase }: EventFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [fromBooking, setFromBooking] = useState(false)

  // Check if coming from booking
  useEffect(() => {
    const isFromBooking = searchParams.get('from_booking') === 'true'
    if (isFromBooking) {
      setFromBooking(true)
      const storedBookingId = localStorage.getItem('booking_id')
      if (storedBookingId) {
        setBookingId(storedBookingId)
      }
    }
  }, [searchParams])

  // Event fields
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('TECNOLOGIA')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [capacity, setCapacity] = useState('')
  const [useOfficialLocation, setUseOfficialLocation] = useState(true)
  const [locationName, setLocationName] = useState(OFFICIAL_LOCATION.name)
  const [address, setAddress] = useState(OFFICIAL_LOCATION.address)
  const [city, setCity] = useState(OFFICIAL_LOCATION.city)
  const [state, setState] = useState(OFFICIAL_LOCATION.state)
  const [isPublished, setIsPublished] = useState(false)

  // Serviços adicionais
  const [hasAudiovisual, setHasAudiovisual] = useState(false)
  const [hasCoverage, setHasCoverage] = useState(false)
  const [hasCoffeeBreak, setHasCoffeeBreak] = useState(false)

  // Modules
  const [modules, setModules] = useState<Module[]>([{ id: createTempId(), title: '', hours: 0 }])

  // Ticket Types
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: createTempId(), name: formatSessionName(0, ''), description: '', price: 0, quantity: 0, autoName: true },
  ])

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

  // Preços dos serviços adicionais
  const AUDIOVISUAL_PRICE = 500
  const COVERAGE_PRICE = 800
  const COFFEE_BREAK_PRICE_PER_PERSON = 15

  // Calcular preços dos adicionais
  const calculateExtras = () => {
    let total = 0
    const extras = []

    if (hasAudiovisual) {
      total += AUDIOVISUAL_PRICE
      extras.push({ name: 'Audiovisual', price: AUDIOVISUAL_PRICE })
    }

    if (hasCoverage) {
      total += COVERAGE_PRICE
      extras.push({ name: 'Cobertura/Gravação', price: COVERAGE_PRICE })
    }

    if (hasCoffeeBreak && capacity) {
      const coffeePrice = COFFEE_BREAK_PRICE_PER_PERSON * parseInt(capacity || '0')
      total += coffeePrice
      extras.push({ name: `Coffee Break (${capacity} pessoas)`, price: coffeePrice })
    }

    return { total, extras }
  }

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
    setTicketTypes((prev) => {
      const newTicket = {
        id: createTempId(),
        name: formatSessionName(prev.length, title),
        description: '',
        price: 0,
        quantity: 0,
        autoName: true,
      }
      return [...prev, newTicket]
    })
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

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho (1MB = 1048576 bytes)
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
      throw new Error('Erro ao fazer upload da imagem')
    }

    const data = await response.json()
    return data.url
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

      // Upload image if selected
      let coverImageUrl = thumbnailUrl
      if (imageFile) {
        setUploadingImage(true)
        try {
          coverImageUrl = await uploadImage(imageFile)
        } catch (err) {
          throw new Error('Erro ao fazer upload da imagem')
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
        booking_id: bookingId || undefined,
        modules: validModules.map((m, index) => ({
          title: m.title,
          hours: m.hours,
          order_index: index,
        })),
        ticket_types: validTickets.map((t) => ({
          name: t.name,
          description: t.description,
          price: parseFloat(t.price.toString()),
          total_quantity: parseInt(t.quantity.toString()),
          sold_quantity: 0,
          is_active: true,
        })),
      }

      // Call API to create event
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar evento')
      }

      // Redirect to event details
      router.push(`${redirectBase}/${result.eventId}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar evento')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Criar <span className="text-primary text-glow">Novo Evento</span>
        </h1>
        <p className="text-placeholder">Preencha as informações abaixo para criar um novo evento</p>
      </div>

      {fromBooking && bookingId && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-primary font-bold mb-1">Pagamento Confirmado!</p>
              <p className="text-placeholder text-sm">
                Sua reserva foi confirmada com sucesso. Agora você pode criar seu evento. Lembre-se: cada reserva permite criar apenas 1 evento.
              </p>
            </div>
          </div>
        </div>
      )}

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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
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
            {/* Card do Local Oficial */}
            <button
              type="button"
              onClick={() => {
                setUseOfficialLocation(true)
                setLocationName(OFFICIAL_LOCATION.name)
                setAddress(OFFICIAL_LOCATION.address)
                setCity(OFFICIAL_LOCATION.city)
                setState(OFFICIAL_LOCATION.state)
              }}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                useOfficialLocation
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  useOfficialLocation ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {useOfficialLocation && (
                    <svg className="w-3 h-3 text-background" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold text-foreground">Local StageOne</span>
                  </div>
                  <p className="text-sm text-placeholder mb-1">{OFFICIAL_LOCATION.name}</p>
                  <p className="text-xs text-placeholder">{OFFICIAL_LOCATION.address}</p>
                  <p className="text-xs text-placeholder mt-1">{OFFICIAL_LOCATION.city} - {OFFICIAL_LOCATION.state}</p>
                </div>
              </div>
            </button>

            {/* Opção Novo Local */}
            <button
              type="button"
              onClick={() => {
                setUseOfficialLocation(false)
                setLocationName('')
                setAddress('')
                setCity('')
                setState('')
              }}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                !useOfficialLocation
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  !useOfficialLocation ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {!useOfficialLocation && (
                    <svg className="w-3 h-3 text-background" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-semibold text-foreground">Novo Local</span>
                  </div>
                  <p className="text-sm text-placeholder mt-1">Adicionar endereço personalizado</p>
                </div>
              </div>
            </button>

            {/* Formulário de Novo Local */}
            {!useOfficialLocation && (
              <div className="space-y-4 mt-4 p-4 bg-background/50 rounded-lg border border-border/30">
                <div>
                  <label className="block text-foreground text-sm mb-2">Nome do Local</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Centro de Convenções"
                    required
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
                    required
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
                      required
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
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Serviços Adicionais */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">Serviços Adicionais</h2>
          <p className="text-placeholder text-sm mb-6">
            Selecione os serviços extras que deseja incluir no evento
          </p>

          <div className="space-y-4">
            <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer bg-background">
              <input
                type="checkbox"
                checked={hasAudiovisual}
                onChange={(e) => setHasAudiovisual(e.target.checked)}
                className="w-5 h-5 mt-1 rounded bg-card border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-foreground font-semibold block">Audiovisual</span>
                    <span className="text-placeholder text-sm">Equipamento completo: projetor, tela, som</span>
                  </div>
                  <span className="text-primary font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(AUDIOVISUAL_PRICE)}
                  </span>
                </div>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer bg-background">
              <input
                type="checkbox"
                checked={hasCoverage}
                onChange={(e) => setHasCoverage(e.target.checked)}
                className="w-5 h-5 mt-1 rounded bg-card border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-foreground font-semibold block">Cobertura/Gravação do Evento</span>
                    <span className="text-placeholder text-sm">Fotografia e vídeo profissional</span>
                  </div>
                  <span className="text-primary font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(COVERAGE_PRICE)}
                  </span>
                </div>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer bg-background">
              <input
                type="checkbox"
                checked={hasCoffeeBreak}
                onChange={(e) => setHasCoffeeBreak(e.target.checked)}
                className="w-5 h-5 mt-1 rounded bg-card border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-foreground font-semibold block">Coffee Break</span>
                    <span className="text-placeholder text-sm">
                      Café, lanches e bebidas ({capacity ? `${capacity} pessoas` : 'informe a capacidade'})
                    </span>
                  </div>
                  <span className="text-primary font-bold">
                    {capacity
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          COFFEE_BREAK_PRICE_PER_PERSON * parseInt(capacity)
                        )
                      : `R$ ${COFFEE_BREAK_PRICE_PER_PERSON}/pessoa`
                    }
                  </span>
                </div>
              </div>
            </label>
          </div>

          {/* Preview de Valores */}
          {(() => {
            const { total, extras } = calculateExtras()
            if (extras.length > 0) {
              return (
                <div className="mt-6 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                  <h3 className="text-foreground font-bold mb-3">Resumo dos Serviços Adicionais</h3>
                  <div className="space-y-2">
                    {extras.map((extra, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-placeholder">{extra.name}</span>
                        <span className="text-foreground font-semibold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(extra.price)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-border flex justify-between">
                      <span className="text-foreground font-bold">Total dos Adicionais</span>
                      <span className="text-primary font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })()}
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
                Configure cada sessão com data, horário e capacidade específica.
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
                    placeholder="Ex: Sessão 01 - 26/01 às 18h - Para 50 pessoas"
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
              Publicar evento imediatamente (visível para todos)
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
            {uploadingImage ? 'Enviando imagem...' : loading ? 'Criando evento...' : 'Criar Evento'}
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
