'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Send,
  Inbox,
  FileText,
  Archive,
  Trash2,
  Search,
  Plus,
  X,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  BarChart3,
  MessageSquare,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'

interface UserOption {
  id: string
  name: string
  email: string
  role: string
}

// Templates de mensagens rápidas
const quickTemplates = [
  {
    id: 'confirm-presence',
    title: 'Confirmação de Presença',
    subject: 'Confirme sua presença no evento',
    content: `Olá {{user_name}},\n\nGostaríamos de confirmar sua presença no evento "{{event_name}}" que acontecerá em {{event_date}}.\n\nPor favor, confirme sua presença clicando no link abaixo ou respondendo este email.\n\nAguardamos você!\n\nAtenciosamente,\nEquipe StageOne™`
  },
  {
    id: 'event-reminder',
    title: 'Lembrete de Evento',
    subject: 'Lembrete: {{event_name}} em breve!',
    content: `Olá {{user_name}},\n\nEste é um lembrete de que o evento "{{event_name}}" está chegando!\n\nData: {{event_date}}\nHorário: {{event_time}}\nLocal: {{event_location}}\n\nNão esqueça de levar seu ingresso (digital ou impresso).\n\nNos vemos lá!\n\nAtenciosamente,\nEquipe StageOne™`
  },
  {
    id: 'payment-followup',
    title: 'Follow-up de Pagamento',
    subject: 'Status do seu pagamento',
    content: `Olá {{user_name}},\n\nIdentificamos que seu pagamento para o evento "{{event_name}}" ainda está pendente.\n\nValor: R$ {{amount}}\nVencimento: {{due_date}}\n\nPor favor, regularize seu pagamento para garantir sua participação.\n\nAtenciosamente,\nEquipe StageOne™`
  },
  {
    id: 'welcome',
    title: 'Boas-vindas',
    subject: 'Bem-vindo à StageOne™!',
    content: `Olá {{user_name}},\n\nSeja muito bem-vindo à StageOne™!\n\nEstamos felizes em tê-lo conosco. Nossa plataforma oferece as melhores experiências em eventos e treinamentos.\n\nExplore nossos eventos disponíveis e encontre aquele que mais combina com você!\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe StageOne™`
  },
  {
    id: 'event-update',
    title: 'Atualização de Evento',
    subject: 'Atualização: {{event_name}}',
    content: `Olá {{user_name}},\n\nInformamos que houve uma atualização no evento "{{event_name}}".\n\n{{update_details}}\n\nPor favor, fique atento às novas informações.\n\nAtenciosamente,\nEquipe StageOne™`
  }
]

export default function MessagesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts' | 'archived'>('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [users, setUsers] = useState<UserOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [messageForm, setMessageForm] = useState({
    to: '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    if (composeOpen) {
      fetchUsers()
    }
  }, [composeOpen])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Mock messages data
  const messages = [
    {
      id: '1',
      from: { name: 'João Silva', email: 'joao@example.com' },
      subject: 'Dúvida sobre o evento',
      preview: 'Olá, gostaria de saber mais informações sobre...',
      status: 'unread' as const,
      priority: 'normal' as const,
      tags: ['evento', 'dúvida'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      from: { name: 'Maria Santos', email: 'maria@example.com' },
      subject: 'Confirmação de presença',
      preview: 'Confirmo minha presença no evento de amanhã...',
      status: 'read' as const,
      priority: 'urgent' as const,
      tags: ['evento', 'confirmação'],
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      from: { name: 'Pedro Oliveira', email: 'pedro@example.com' },
      subject: 'Solicitação de reembolso',
      preview: 'Não poderei comparecer ao evento e gostaria...',
      status: 'read' as const,
      priority: 'high' as const,
      tags: ['financeiro', 'reembolso'],
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
  ]

  const handleTemplateSelect = (templateId: string) => {
    const template = quickTemplates.find(t => t.id === templateId)
    if (template) {
      setMessageForm({
        ...messageForm,
        subject: template.subject,
        content: template.content
      })
      setSelectedTemplate(templateId)
    }
  }

  const handleSend = () => {
    console.log('Enviando mensagem:', messageForm)
    // Aqui você implementará a lógica de envio
    setComposeOpen(false)
    setMessageForm({ to: '', subject: '', content: '' })
    setSelectedTemplate('')
  }

  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `Há ${diffMins}min`
    if (diffHours < 24) return `Há ${diffHours}h`
    if (diffDays === 1) return 'Ontem'
    return time.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border/30 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/painel/crm"
              className="text-placeholder hover:text-primary transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Mensagens
              </h1>
              <p className="text-sm text-placeholder">Central de comunicação</p>
            </div>
          </div>

          <button
            onClick={() => setComposeOpen(true)}
            className="bg-primary text-background font-bold px-6 py-2.5 rounded-full text-sm transition-all duration-300 hover:shadow-glow-md hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Mensagem
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-4 border border-border/30 space-y-2">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-primary text-background font-semibold'
                    : 'text-placeholder hover:text-foreground hover:bg-card'
                }`}
              >
                <Inbox className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">Inbox</span>
                <span className="text-xs bg-background/20 px-2 py-0.5 rounded-full">
                  {messages.filter(m => m.status === 'unread').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('sent')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'sent'
                    ? 'bg-primary text-background font-semibold'
                    : 'text-placeholder hover:text-foreground hover:bg-card'
                }`}
              >
                <Send className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">Enviadas</span>
              </button>

              <button
                onClick={() => setActiveTab('drafts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'drafts'
                    ? 'bg-primary text-background font-semibold'
                    : 'text-placeholder hover:text-foreground hover:bg-card'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">Rascunhos</span>
                <span className="text-xs bg-background/20 px-2 py-0.5 rounded-full">0</span>
              </button>

              <button
                onClick={() => setActiveTab('archived')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'archived'
                    ? 'bg-primary text-background font-semibold'
                    : 'text-placeholder hover:text-foreground hover:bg-card'
                }`}
              >
                <Archive className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">Arquivadas</span>
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-6 border border-border/30">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-placeholder" />
                  <input
                    type="text"
                    placeholder="Buscar mensagens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 glass rounded-lg border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      message.status === 'unread'
                        ? 'bg-primary/5 border-primary/30 hover:bg-primary/10'
                        : 'bg-card/30 border-border/30 hover:bg-card/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${message.status === 'unread' ? 'text-foreground' : 'text-placeholder'}`}>
                            {message.from.name}
                          </p>
                          <p className="text-xs text-placeholder">{message.from.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {message.priority === 'urgent' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-semibold">
                            Urgente
                          </span>
                        )}
                        <span className="text-xs text-placeholder">{getRelativeTime(message.timestamp)}</span>
                      </div>
                    </div>

                    <h3 className={`text-sm mb-1 ${message.status === 'unread' ? 'font-semibold text-foreground' : 'text-placeholder'}`}>
                      {message.subject}
                    </h3>
                    <p className="text-sm text-placeholder line-clamp-1 mb-2">
                      {message.preview}
                    </p>

                    <div className="flex items-center gap-2">
                      {message.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-2xl border border-border/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 glass border-b border-border/30 p-6 backdrop-blur-xl z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Nova Mensagem
                </h3>
                <button
                  onClick={() => setComposeOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-placeholder hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Templates Rápidos */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Templates Rápidos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedTemplate === template.id
                          ? 'bg-primary/20 border-primary text-primary font-semibold'
                          : 'bg-card/30 border-border/30 hover:border-primary/50 text-placeholder hover:text-foreground'
                      }`}
                    >
                      <FileText className="w-4 h-4 mb-1" />
                      <p className="text-xs">{template.title}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destinatário */}
              <div className="relative">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Para
                </label>

                {/* Campo de Input com Dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    value={messageForm.to}
                    onChange={(e) => {
                      setMessageForm({ ...messageForm, to: e.target.value })
                      setShowUserDropdown(true)
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    placeholder="Digite ou selecione um email"
                    className="w-full px-4 py-3 pr-10 glass rounded-xl border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-placeholder hover:text-primary transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Dropdown de Usuários */}
                {showUserDropdown && (
                  <>
                    {/* Overlay para fechar o dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserDropdown(false)}
                    />

                    <div className="absolute top-full left-0 right-0 mt-2 z-20 glass rounded-xl border border-border/30 max-h-64 overflow-y-auto shadow-2xl">
                      {loadingUsers ? (
                        <div className="p-4 text-center text-placeholder">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          Carregando usuários...
                        </div>
                      ) : users.length > 0 ? (
                        <div className="p-2">
                          {users
                            .filter(user =>
                              user.email.toLowerCase().includes(messageForm.to.toLowerCase()) ||
                              user.name.toLowerCase().includes(messageForm.to.toLowerCase())
                            )
                            .map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  setMessageForm({ ...messageForm, to: user.email })
                                  setShowUserDropdown(false)
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all text-left group"
                              >
                                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                                  <span className="text-sm font-bold text-primary">
                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-placeholder truncate">
                                    {user.email}
                                  </p>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                                  user.role === 'ADMIN'
                                    ? 'bg-red-500/10 text-red-500'
                                    : user.role === 'PALESTRANTE'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {user.role}
                                </span>
                              </button>
                            ))
                          }
                          {users.filter(user =>
                            user.email.toLowerCase().includes(messageForm.to.toLowerCase()) ||
                            user.name.toLowerCase().includes(messageForm.to.toLowerCase())
                          ).length === 0 && (
                            <div className="p-4 text-center text-placeholder text-sm">
                              Nenhum usuário encontrado
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-placeholder text-sm">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Nenhum usuário disponível
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Assunto */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  placeholder="Assunto da mensagem"
                  className="w-full px-4 py-3 glass rounded-xl border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mensagem
                </label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                  placeholder="Digite sua mensagem aqui..."
                  rows={12}
                  className="w-full px-4 py-3 glass rounded-xl border border-border/30 text-foreground placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <p className="text-xs text-placeholder mt-2">
                  Variáveis disponíveis: {`{{user_name}}, {{event_name}}, {{event_date}}, {{amount}}`}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 glass border-t border-border/30 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setComposeOpen(false)}
                  className="flex-1 px-6 py-3 rounded-full border border-border/30 text-foreground font-semibold hover:bg-card transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  disabled={!messageForm.to || !messageForm.subject || !messageForm.content}
                  className="flex-1 px-6 py-3 rounded-full bg-primary text-background font-bold hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
