'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
}

interface EventFormProps {
  backUrl: string
  redirectBase: string
}

export default function EventForm({ backUrl, redirectBase }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Event fields
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('TECNOLOGIA')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [capacity, setCapacity] = useState('')
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  // Modules
  const [modules, setModules] = useState<Module[]>([{ id: '1', title: '', hours: 0 }])

  // Ticket Types
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: '1', name: '', description: '', price: 0, quantity: 0 },
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

  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), title: '', hours: 0 }])
  }

  const removeModule = (id: string) => {
    if (modules.length > 1) {
      setModules(modules.filter((m) => m.id !== id))
    }
  }

  const updateModule = (id: string, field: 'title' | 'hours', value: string | number) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: 0,
        quantity: 0,
      },
    ])
  }

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((t) => t.id !== id))
    }
  }

  const updateTicketType = (id: string, field: keyof TicketType, value: string | number) => {
    setTicketTypes(ticketTypes.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
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
        start_datetime: datetime,
        capacity: parseInt(capacity),
        location_name: locationName,
        address,
        city,
        state,
        is_published: isPublished,
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

        {/* Tipos de Ingressos */}
        <div className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Tipos de Ingressos *</h2>
            <button
              type="button"
              onClick={addTicketType}
              className="btn-primary text-sm"
            >
              + Adicionar Tipo
            </button>
          </div>

          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={ticket.id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-placeholder text-sm">Ingresso {index + 1}</span>
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
                    placeholder="Nome do ingresso (ex: Lote 1 - Early Bird)"
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
                      <label className="block text-placeholder text-xs mb-1">Quantidade</label>
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
            disabled={loading}
            className="btn-primary flex-1 text-lg disabled:bg-card-hover disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Criando evento...' : 'Criar Evento'}
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
