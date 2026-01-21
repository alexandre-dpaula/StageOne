'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FileText, BookOpen, Ticket, DollarSign, MapPin, Rocket, Check, ChevronLeft, X } from 'lucide-react'
import { OFFICIAL_LOCATION } from '@/lib/constants/location'

interface Module {
  id: string
  title: string
  hours: number
}

interface TicketType {
  id: string
  name: string
  date: string
  time: string
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

  // Step control
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

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
  const [category, setCategory] = useState('MARKETING')
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

  // Marketplace - Cost Calculation
  const [eventCosts, setEventCosts] = useState<{
    room_price: number
    audiovisual_price: number
    coffee_break_price: number
    coverage_price: number
    total_service_cost: number
  } | null>(null)
  const [calculatingCost, setCalculatingCost] = useState(false)

  // Modules
  const [modules, setModules] = useState<Module[]>([{ id: createTempId(), title: '', hours: 0 }])

  // Ticket Types
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: createTempId(), name: formatSessionName(0, ''), date: '', time: '', price: 0, quantity: 0, autoName: true },
  ])

  const categories = [
    'MARKETING',
    'VENDAS',
    'GESTÃO',
    'LIDERANÇA',
    'EDUCAÇÃO',
    'DESENVOLVIMENTO DE PESSOAS',
    'TECNOLOGIA',
    'SAÚDE',
  ]

  // Calculate total event duration in hours
  const calculateEventDuration = () => {
    const validModules = modules.filter((m) => m.hours > 0)
    return validModules.reduce((sum, m) => sum + m.hours, 0)
  }

  // Fetch cost calculation from API
  const fetchCostCalculation = async () => {
    const duration = calculateEventDuration()
    if (duration < 3) return // Minimum 3 hours

    setCalculatingCost(true)
    try {
      const response = await fetch('/api/events/calculate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_hours: duration,
          has_audiovisual: hasAudiovisual,
          has_coffee_break: hasCoffeeBreak,
          has_coverage: hasCoverage,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setEventCosts(data.costs)
      }
    } catch (error) {
      console.error('Error calculating costs:', error)
    } finally {
      setCalculatingCost(false)
    }
  }

  // Recalculate costs when dependencies change
  useEffect(() => {
    const duration = calculateEventDuration()
    if (duration >= 3) {
      fetchCostCalculation()
    } else {
      setEventCosts(null)
    }
  }, [modules, hasAudiovisual, hasCoffeeBreak, hasCoverage])

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
        date: '',
        time: '',
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

  // Step validation
  const validateStep = (step: number): boolean => {
    setError('')

    switch (step) {
      case 1: // Informações Básicas
        if (!title || !subtitle || !description) {
          setError('Preencha todos os campos obrigatórios')
          return false
        }
        return true

      case 2: // Módulos
        const validModules = modules.filter((m) => m.title && m.hours > 0)
        if (validModules.length === 0) {
          setError('Adicione pelo menos um módulo válido')
          return false
        }
        if (calculateEventDuration() < 3) {
          setError('A duração total do evento deve ser de no mínimo 3 horas')
          return false
        }
        return true

      case 3: // Sessões
        const validTickets = ticketTypes.filter((t) => t.name && t.date && t.time && t.price >= 0 && t.quantity > 0 && t.quantity <= 25)
        if (validTickets.length === 0) {
          setError('Adicione pelo menos uma sessão válida com data, horário e até 25 vagas')
          return false
        }
        return true

      case 4: // Custos
        // Validação automática - apenas verificar se há custos calculados
        return true

      case 5: // Localização
        if (!locationName || !address || !city || !state) {
          setError('Preencha todos os campos de localização')
          return false
        }
        return true

      case 6: // Publicação
        return true

      default:
        return true
    }
  }

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const steps = [
    { number: 1, title: 'Informações Básicas', Icon: FileText },
    { number: 2, title: 'Módulos do Evento', Icon: BookOpen },
    { number: 3, title: 'Sessões do Evento', Icon: Ticket },
    { number: 4, title: 'Custos do Evento', Icon: DollarSign },
    { number: 5, title: 'Localização', Icon: MapPin },
    { number: 6, title: 'Publicação', Icon: Rocket },
  ]

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

    // Validar todos os steps antes de submeter
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const validModules = modules.filter((m) => m.title && m.hours > 0)
      const validTickets = ticketTypes.filter((t) => t.name && t.date && t.time && t.price >= 0 && t.quantity > 0 && t.quantity <= 25)

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

      // Usar a primeira sessão para definir start_datetime do evento
      const firstSession = validTickets[0]
      const datetime = `${firstSession.date}T${firstSession.time}:00`

      // Calculate event duration
      const eventDuration = calculateEventDuration()

      // Create event data
      const eventData = {
        title,
        subtitle,
        description,
        slug,
        category,
        cover_image: coverImageUrl || null,
        start_datetime: datetime,
        capacity: 25, // Capacidade fixa por sessão
        location_name: locationName,
        address,
        city,
        state,
        is_published: isPublished,
        booking_id: bookingId || undefined,
        // Marketplace fields
        event_duration_hours: eventDuration,
        has_audiovisual: hasAudiovisual,
        has_coffee_break: hasCoffeeBreak,
        has_coverage: hasCoverage,
        room_price: eventCosts?.room_price || 0,
        audiovisual_price: eventCosts?.audiovisual_price || 0,
        coffee_break_price: eventCosts?.coffee_break_price || 0,
        coverage_price: eventCosts?.coverage_price || 0,
        total_service_cost: eventCosts?.total_service_cost || 0,
        platform_fee_percentage: 3, // 3% platform fee
        status: 'PENDING_APPROVAL', // Requires admin approval
        modules: validModules.map((m, index) => ({
          title: m.title,
          hours: m.hours,
          order_index: index,
        })),
        ticket_types: validTickets.map((t) => ({
          name: t.name,
          description: `${t.date} às ${t.time}`,
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

      {/* Progress Bar */}
      <div className="glass rounded-2xl p-4 md:p-6 border border-border/30 mb-8">
        {/* Steps Navigation - Desktop */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => goToStep(step.number)}
                className={`flex flex-col items-center gap-2 transition-all ${
                  currentStep === step.number
                    ? 'scale-110'
                    : currentStep > step.number
                    ? 'opacity-100'
                    : 'opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep === step.number
                      ? 'border-primary bg-primary/20 shadow-lg shadow-primary/50'
                      : currentStep > step.number
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-border bg-background'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <step.Icon className={`w-5 h-5 ${currentStep === step.number ? 'text-primary' : 'text-placeholder'}`} />
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    currentStep === step.number ? 'text-primary' : 'text-placeholder'
                  }`}
                >
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <div
                    className={`h-full rounded transition-all ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-border'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Steps Navigation - Mobile/Tablet (Simplified) */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
          {steps.map((step) => (
            <button
              key={step.number}
              type="button"
              onClick={() => goToStep(step.number)}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                currentStep === step.number
                  ? 'border-primary bg-primary/20 scale-110'
                  : currentStep > step.number
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-border bg-background opacity-50'
              }`}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <step.Icon className={`w-5 h-5 ${currentStep === step.number ? 'text-primary' : 'text-placeholder'}`} />
              )}
            </button>
          ))}
        </div>

        {/* Progress Text */}
        <div className="text-center">
          <p className="text-sm text-placeholder mb-2">
            Etapa {currentStep} de {totalSteps}: <span className="font-semibold text-foreground">{steps[currentStep - 1].title}</span>
          </p>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Informações Básicas */}
        {currentStep === 1 && (
        <div className="glass rounded-2xl p-6 border border-border/30 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{steps[0].title}</h2>
          </div>

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

          </div>
        </div>
        )}

        {/* Step 2: Módulos do Evento */}
        {currentStep === 2 && (
        <div className="glass rounded-2xl p-6 border border-border/30 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{steps[1].title}</h2>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="glass border border-primary/50 hover:bg-primary/10 text-primary px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm font-medium flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>Módulo</span>
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
        )}

        {/* Step 3: Sessões do Evento */}
        {currentStep === 3 && (
        <div className="glass rounded-2xl p-6 border border-border/30 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">{steps[2].title}</h2>
              </div>
              <p className="text-sm text-placeholder mt-1">
                Configure cada sessão com data, horário e capacidade específica.
              </p>
            </div>
            <button
              type="button"
              onClick={addTicketType}
              className="glass border border-primary/50 hover:bg-primary/10 text-primary px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm font-medium flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>Sessão</span>
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

                <div className="space-y-4">
                  {/* Nome da Sessão (auto-gerado) */}
                  <div>
                    <label className="block text-placeholder text-xs mb-1">Nome da Sessão</label>
                    <input
                      type="text"
                      value={ticket.name}
                      onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                      className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ex: Sessão 01 - Workshop de Liderança"
                      required
                    />
                  </div>

                  {/* Data e Horário */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-placeholder text-xs mb-1">Data *</label>
                      <input
                        type="date"
                        value={ticket.date}
                        onChange={(e) => updateTicketType(ticket.id, 'date', e.target.value)}
                        className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-placeholder text-xs mb-1">Horário *</label>
                      <input
                        type="time"
                        value={ticket.time}
                        onChange={(e) => updateTicketType(ticket.id, 'time', e.target.value)}
                        className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Preço e Vagas */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-placeholder text-xs mb-1">Preço do Ingresso (R$) *</label>
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
                      <label className="block text-placeholder text-xs mb-1">Vagas (máx. 25) *</label>
                      <input
                        type="number"
                        value={ticket.quantity || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0
                          updateTicketType(ticket.id, 'quantity', Math.min(value, 25))
                        }}
                        className="w-full bg-background text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: 25"
                        min="1"
                        max="25"
                        required
                      />
                      <p className="text-xs text-placeholder mt-1">Máximo de 25 vagas por sessão</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Step 4: Custos do Evento */}
        {currentStep === 4 && (
        <div className="glass rounded-2xl p-6 border border-border/30 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{steps[3].title}</h2>
          </div>
          <p className="text-placeholder text-sm mb-6">
            Configure a duração e serviços adicionais. Os custos serão automaticamente debitados das vendas de ingressos.
          </p>

          {/* Duration Info */}
          <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="w-full">
                <p className="text-foreground font-semibold mb-1">Duração do Evento</p>
                <p className="text-sm text-placeholder">
                  {calculateEventDuration() > 0 ? (
                    <>
                      <span className="font-bold text-blue-500">{calculateEventDuration()}h</span> (calculado a partir dos módulos)
                      {calculateEventDuration() < 3 && <span className="text-orange-500"> • Mínimo: 3 horas</span>}
                      {calculateEventDuration() >= 3 && calculateEventDuration() < 4 && (
                        <span className="text-orange-500"> • R$ 150/h para eventos com menos de 4h</span>
                      )}
                      {calculateEventDuration() >= 4 && (
                        <span className="text-green-500"> • R$ 120/h</span>
                      )}
                    </>
                  ) : (
                    'Adicione módulos para calcular a duração'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Serviços Adicionais */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer bg-background">
              <input
                type="checkbox"
                checked={hasAudiovisual}
                onChange={(e) => setHasAudiovisual(e.target.checked)}
                className="w-5 h-5 mt-1 rounded bg-card border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-foreground font-semibold block">Audiovisual</span>
                    <span className="text-placeholder text-sm">Projetor, tela, som e microfone</span>
                  </div>
                  {eventCosts && (
                    <span className="text-primary font-bold whitespace-nowrap ml-2">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventCosts.audiovisual_price)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-placeholder">R$ 100 base (4h) + R$ 12,50/hora adicional</span>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer bg-background">
              <input
                type="checkbox"
                checked={hasCoffeeBreak}
                onChange={(e) => setHasCoffeeBreak(e.target.checked)}
                className="w-5 h-5 mt-1 rounded bg-card border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-foreground font-semibold block">Coffee Break</span>
                    <span className="text-placeholder text-sm">Café, lanches e bebidas</span>
                  </div>
                  {eventCosts && (
                    <span className="text-primary font-bold whitespace-nowrap ml-2">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventCosts.coffee_break_price)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-placeholder">R$ 150 base (4h) + R$ 12,50/hora adicional</span>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer bg-background">
              <input
                type="checkbox"
                checked={hasCoverage}
                onChange={(e) => setHasCoverage(e.target.checked)}
                className="w-5 h-5 mt-1 rounded bg-card border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-foreground font-semibold block">Cobertura Profissional</span>
                    <span className="text-placeholder text-sm">Fotografia e vídeo do evento</span>
                  </div>
                  {eventCosts && (
                    <span className="text-primary font-bold whitespace-nowrap ml-2">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventCosts.coverage_price)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-placeholder">R$ 250 base (4h) + R$ 12,50/hora adicional</span>
              </div>
            </label>
          </div>

          {/* Cost Summary */}
          {calculatingCost ? (
            <div className="flex items-center justify-center p-6 text-placeholder">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculando custos...
            </div>
          ) : eventCosts ? (
            <div className="p-5 rounded-lg border-2 border-primary/30 bg-primary/5">
              <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Resumo de Custos
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-placeholder flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Aluguel da Sala ({calculateEventDuration()}h)
                  </span>
                  <span className="text-foreground font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventCosts.room_price)}
                  </span>
                </div>
                {hasAudiovisual && (
                  <div className="flex justify-between text-sm">
                    <span className="text-placeholder">+ Audiovisual</span>
                    <span className="text-foreground font-semibold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventCosts.audiovisual_price)}
                    </span>
                  </div>
                )}
                {hasCoffeeBreak && (
                  <div className="flex justify-between text-sm">
                    <span className="text-placeholder">+ Coffee Break</span>
                    <span className="text-foreground font-semibold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventCosts.coffee_break_price)}
                    </span>
                  </div>
                )}
                {hasCoverage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-placeholder">+ Cobertura</span>
                    <span className="text-foreground font-semibold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventCosts.coverage_price)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t-2 border-primary/30 flex justify-between items-center">
                  <span className="text-foreground font-bold">Total de Custos</span>
                  <span className="text-primary font-bold text-xl">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventCosts.total_service_cost)}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-placeholder flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estes custos serão automaticamente debitados das vendas de ingressos. Você receberá o valor líquido (vendas - custos - taxas).
                </p>
              </div>
            </div>
          ) : calculateEventDuration() < 3 ? (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-sm text-placeholder">
              Configure pelo menos 3 horas de módulos para calcular os custos
            </div>
          ) : null}
        </div>
        )}

        {/* Step 5: Localização */}
        {currentStep === 5 && (
        <div className="glass rounded-2xl p-6 border border-border/30 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{steps[4].title}</h2>
          </div>

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
        )}

        {/* Step 6: Publicação */}
        {currentStep === 6 && (
        <div className="glass rounded-2xl p-6 border border-border/30 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{steps[5].title}</h2>
          </div>

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
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center gap-3 mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={loading}
              className="w-12 h-12 glass border border-border/30 hover:border-primary/50 text-foreground rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={goToNextStep}
              disabled={loading}
              className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="btn-primary px-8 py-3 text-base disabled:bg-card-hover disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {uploadingImage ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando imagem...
                </>
              ) : loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando evento...
                </>
              ) : (
                <>
                  Criar Evento
                </>
              )}
            </button>
          )}

          <Link
            href={backUrl}
            className="glass border border-border/30 hover:border-red-500/50 text-foreground hover:text-red-500 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 px-4 py-3"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Cancelar</span>
          </Link>
        </div>
      </form>
    </div>
  )
}
